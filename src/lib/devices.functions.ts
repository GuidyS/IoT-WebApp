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
    (data: { deviceId: string; state: boolean; temperature?: number; source?: "ui" | "esp32" | "automation" }) => {
      if (!data?.deviceId || typeof data.deviceId !== "string") throw new Error("deviceId required");
      if (typeof data.state !== "boolean") throw new Error("state must be boolean");
      if (data.deviceId.length > 64) throw new Error("deviceId too long");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const updatedAt = new Date().toISOString();
    
    const { document: current } = await mongo.findOne<{ state: boolean }>(COLLECTIONS.deviceStates, { deviceId: data.deviceId });
    const isStateChanged = !current || current.state !== data.state;

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

    if (isStateChanged) {
      if (data.state === true) {
        await mongo.insertOne(COLLECTIONS.deviceStateLogs, {
          deviceId: data.deviceId,
          turnedOnAt: updatedAt,
          turnedOffAt: null,
          durationHours: 0
        });
      } else {
        const { documents } = await mongo.find<{ _id: string, turnedOnAt: string }>(
          COLLECTIONS.deviceStateLogs, 
          { deviceId: data.deviceId, turnedOffAt: null }
        );
        if (documents && documents.length > 0) {
          const openLog = documents[0];
          const onTime = new Date(openLog.turnedOnAt).getTime();
          const offTime = new Date(updatedAt).getTime();
          const durationHours = (offTime - onTime) / (1000 * 60 * 60);
          await mongo.updateOne(
            COLLECTIONS.deviceStateLogs,
            { _id: openLog._id },
            { $set: { turnedOffAt: updatedAt, durationHours } }
          );
        }
      }
    }

    return { ok: true, updatedAt };
  });

export const getDeviceUsageStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { documents: logs } = await mongo.find<{ deviceId: string, turnedOnAt: string, turnedOffAt: string | null, durationHours: number }>(COLLECTIONS.deviceStateLogs, {});
    
    const stats: Record<string, number> = {};
    const now = Date.now();

    for (const log of logs || []) {
      if (!stats[log.deviceId]) stats[log.deviceId] = 0;

      if (log.turnedOffAt) {
        stats[log.deviceId] += log.durationHours;
      } else {
        const onTime = new Date(log.turnedOnAt).getTime();
        const currentDurationHours = (now - onTime) / (1000 * 60 * 60);
        stats[log.deviceId] += currentDurationHours;
      }
    }

    return { stats, error: null };
  } catch (err) {
    console.error("getDeviceUsageStats failed", err);
    return { stats: {} as Record<string, number>, error: (err as Error).message };
  }
});
