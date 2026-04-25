import { createFileRoute } from "@tanstack/react-router";
import { mongo, COLLECTIONS } from "@/lib/mongo.server";

interface IncomingState {
  deviceId: string;
  state: boolean;
  temperature?: number;
}

function checkAuth(request: Request): boolean {
  const token = process.env.DEVICE_INGEST_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : header.trim();
  return provided === token;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/public/devices/state")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      // GET — ESP32 อ่านสถานะปัจจุบันได้ (เช่นซิงก์กลับ)
      GET: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        try {
          const { documents } = await mongo.find(COLLECTIONS.deviceStates, {});
          return new Response(JSON.stringify({ states: documents ?? [] }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }
      },

      // POST — ESP32 ส่งสถานะอัปเดต (1 ตัวหรือหลายตัวเป็น array ใน body.states)
      POST: async ({ request }) => {
        if (!checkAuth(request)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        let body: { states?: IncomingState[] } & Partial<IncomingState>;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "invalid json" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        const items: IncomingState[] = Array.isArray(body.states)
          ? body.states
          : body.deviceId
            ? [{ deviceId: body.deviceId!, state: !!body.state, temperature: body.temperature }]
            : [];

        if (items.length === 0) {
          return new Response(JSON.stringify({ error: "no items" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const updatedAt = new Date().toISOString();
        const results: Array<{ deviceId: string; ok: boolean; error?: string }> = [];

        for (const item of items) {
          if (!item?.deviceId || typeof item.state !== "boolean") {
            results.push({ deviceId: item?.deviceId ?? "", ok: false, error: "invalid item" });
            continue;
          }
          if (item.deviceId.length > 64) {
            results.push({ deviceId: item.deviceId, ok: false, error: "deviceId too long" });
            continue;
          }
          try {
            const set: Record<string, unknown> = {
              deviceId: item.deviceId,
              state: item.state,
              updatedAt,
              source: "esp32",
            };
            if (typeof item.temperature === "number") set.temperature = item.temperature;
            await mongo.updateOne(
              COLLECTIONS.deviceStates,
              { deviceId: item.deviceId },
              { $set: set },
              true,
            );
            results.push({ deviceId: item.deviceId, ok: true });
          } catch (err) {
            results.push({ deviceId: item.deviceId, ok: false, error: (err as Error).message });
          }
        }

        return new Response(JSON.stringify({ ok: true, updatedAt, results }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      },
    },
  },
});
