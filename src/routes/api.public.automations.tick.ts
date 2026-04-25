import { createFileRoute } from "@tanstack/react-router";
import { mongo, COLLECTIONS } from "@/lib/mongo.server";
import type { Automation } from "@/lib/devices.shared";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function checkAuth(request: Request): boolean {
  const token = process.env.DEVICE_INGEST_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : header.trim();
  return provided === token;
}

// Bangkok offset (UTC+7) — ใช้เวลาท้องถิ่นในการเทียบ schedule
function nowBangkok() {
  const utc = new Date();
  const local = new Date(utc.getTime() + 7 * 60 * 60 * 1000);
  return {
    hh: local.getUTCHours(),
    mm: local.getUTCMinutes(),
    dow: local.getUTCDay(),
    iso: utc.toISOString(),
    dayKey: local.toISOString().slice(0, 10),
  };
}

export const Route = createFileRoute("/api/public/automations/tick")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const now = nowBangkok();
        const currentTime = `${String(now.hh).padStart(2, "0")}:${String(now.mm).padStart(2, "0")}`;

        const { documents } = await mongo.find<Automation>(COLLECTIONS.automations, {
          enabled: true,
        });

        const ran: Array<{ id: string; deviceId: string }> = [];

        for (const a of documents ?? []) {
          if (!a.daysOfWeek?.includes(now.dow)) continue;
          if (a.time !== currentTime) continue;
          // กันรันซ้ำในนาทีเดียวกัน — เช็คว่าวันนี้ + เวลานี้ run ไปยัง
          const lastKey = a.lastRunAt ? a.lastRunAt.slice(0, 16) : "";
          const thisKey = `${now.dayKey}T${currentTime}`;
          if (lastKey === thisKey) continue;

          try {
            const set: Record<string, unknown> = {
              deviceId: a.action.deviceId,
              state: a.action.state,
              updatedAt: now.iso,
              source: "automation",
            };
            if (typeof a.action.temperature === "number") set.temperature = a.action.temperature;
            await mongo.updateOne(
              COLLECTIONS.deviceStates,
              { deviceId: a.action.deviceId },
              { $set: set },
              true,
            );
            await mongo.updateOne(
              COLLECTIONS.automations,
              { id: a.id },
              { $set: { lastRunAt: thisKey } },
            );
            ran.push({ id: a.id, deviceId: a.action.deviceId });
          } catch (err) {
            console.error("automation run failed", a.id, err);
          }
        }

        return new Response(JSON.stringify({ ok: true, currentTime, ran }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      },
    },
  },
});
