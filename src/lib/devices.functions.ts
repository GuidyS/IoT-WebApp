import { createServerFn } from "@tanstack/react-start";
import { mongo, COLLECTIONS } from "./mongo.server";
import type { DeviceState } from "./devices.shared";

export const getDeviceStates = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { documents } = await mongo.find<DeviceState>(COLLECTIONS.deviceStates, {});
    return { states: documents ?? [], error: null as string | null };
  } catch (err) {
    console.error("getDeviceStates failed", err);
    return { states: [] as DeviceState[], error: (err as Error).message };
  }
});

export const setDeviceState = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { deviceId: string; state: boolean; temperature?: number; source?: "ui" | "automation" }) => {
      if (!data?.deviceId || typeof data.deviceId !== "string") throw new Error("deviceId required");
      if (typeof data.state !== "boolean") throw new Error("state must be boolean");
      if (data.deviceId.length > 64) throw new Error("deviceId too long");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const updatedAt = new Date().toISOString();
    const set: Record<string, unknown> = {
      deviceId: data.deviceId,
      state: data.state,
      updatedAt,
      source: data.source ?? "ui",
    };
    if (typeof data.temperature === "number") set.temperature = data.temperature;
    await mongo.updateOne(
      COLLECTIONS.deviceStates,
      { deviceId: data.deviceId },
      { $set: set },
      true,
    );
    return { ok: true, updatedAt };
  });
