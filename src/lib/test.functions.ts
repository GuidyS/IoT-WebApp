// Internal test endpoint — เรียกผ่าน server function (ไม่มี auth gate ใน sandbox)
// ใช้สำหรับทดสอบ insert/upsert จาก dev environment เท่านั้น
import { createServerFn } from "@tanstack/react-start";
import { mongo, COLLECTIONS } from "./mongo.server";

export const seedDeviceStates = createServerFn({ method: "POST" }).handler(async () => {
  const updatedAt = new Date().toISOString();

  // Insert/upsert + เพิ่ม fields ใหม่: location, powerWatts, lastChangedBy
  const seed = [
    { deviceId: "living-light", state: true, location: "ห้องนั่งเล่น", powerWatts: 18, lastChangedBy: "seed" },
    { deviceId: "living-ac", state: true, temperature: 24, location: "ห้องนั่งเล่น", powerWatts: 1200, lastChangedBy: "seed" },
    { deviceId: "living-curtain", state: false, location: "ห้องนั่งเล่น", powerWatts: 5, lastChangedBy: "seed" },
    { deviceId: "kitchen-light", state: false, location: "ห้องครัว", powerWatts: 12, lastChangedBy: "seed" },
    { deviceId: "kitchen-fan", state: false, location: "ห้องครัว", powerWatts: 35, lastChangedBy: "seed" },
    { deviceId: "bedroom-light", state: false, location: "ห้องนอน", powerWatts: 15, lastChangedBy: "seed" },
    { deviceId: "bedroom-ac", state: false, temperature: 26, location: "ห้องนอน", powerWatts: 900, lastChangedBy: "seed" },
    { deviceId: "bedroom-lock", state: true, location: "ห้องนอน", powerWatts: 2, lastChangedBy: "seed" },
    { deviceId: "bath-light", state: false, location: "ห้องน้ำ", powerWatts: 10, lastChangedBy: "seed" },
    { deviceId: "garage-light", state: false, location: "โรงรถ", powerWatts: 24, lastChangedBy: "seed" },
    { deviceId: "garage-lock", state: true, location: "โรงรถ", powerWatts: 3, lastChangedBy: "seed" },
  ];

  const results: Array<{ deviceId: string; ok: boolean; error?: string }> = [];
  for (const item of seed) {
    try {
      await mongo.updateOne(
        COLLECTIONS.deviceStates,
        { deviceId: item.deviceId },
        { $set: { ...item, updatedAt, source: "seed" } },
        true,
      );
      results.push({ deviceId: item.deviceId, ok: true });
    } catch (err) {
      results.push({ deviceId: item.deviceId, ok: false, error: (err as Error).message });
    }
  }
  return { ok: true, count: results.filter((r) => r.ok).length, results };
});
