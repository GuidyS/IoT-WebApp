import { createServerFn } from "@tanstack/react-start";
import { mongo, COLLECTIONS } from "./mongo.server";
import type { Automation } from "./devices.shared";

function genId() {
  return "auto_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const listAutomations = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { documents } = await mongo.find<Automation>(COLLECTIONS.automations, {}, {
      sort: { createdAt: -1 },
    });
    return { automations: documents ?? [], error: null as string | null };
  } catch (err) {
    console.error("listAutomations failed", err);
    return { automations: [] as Automation[], error: (err as Error).message };
  }
});

export const createAutomation = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<Automation, "id" | "createdAt">) => {
    if (!data?.name || data.name.length > 100) throw new Error("invalid name");
    if (!TIME_RE.test(data.time)) throw new Error("time must be HH:MM");
    if (!Array.isArray(data.daysOfWeek) || data.daysOfWeek.some((d) => d < 0 || d > 6))
      throw new Error("invalid daysOfWeek");
    if (!data.action?.deviceId) throw new Error("action.deviceId required");
    if (typeof data.action.state !== "boolean") throw new Error("action.state required");
    return data;
  })
  .handler(async ({ data }) => {
    const doc: Automation = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    await mongo.insertOne(COLLECTIONS.automations, doc as unknown as Record<string, unknown>);
    return { automation: doc };
  });

export const toggleAutomation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; enabled: boolean }) => {
    if (!data?.id) throw new Error("id required");
    if (typeof data.enabled !== "boolean") throw new Error("enabled required");
    return data;
  })
  .handler(async ({ data }) => {
    await mongo.updateOne(
      COLLECTIONS.automations,
      { id: data.id },
      { $set: { enabled: data.enabled } },
    );
    return { ok: true };
  });

export const deleteAutomation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("id required");
    return data;
  })
  .handler(async ({ data }) => {
    await mongo.deleteOne(COLLECTIONS.automations, { id: data.id });
    return { ok: true };
  });
