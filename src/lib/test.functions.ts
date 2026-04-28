// Internal test endpoint — เรียกผ่าน server function (ไม่มี auth gate ใน sandbox)
// ใช้สำหรับทดสอบ insert/upsert จาก dev environment เท่านั้น
import { createServerFn } from "@tanstack/react-start";
import { mongo, COLLECTIONS } from "./mongo.server";

export const seedDeviceStates = createServerFn({ method: "POST" }).handler(async () => {
  const updatedAt = new Date().toISOString();

  // Insert/upsert + เพิ่ม fields ใหม่: location, powerWatts, lastChangedBy
  const seed = [
    { deviceId: "bedroom-curtain", state: false, location: "ห้องนอน", powerWatts: 10, lastChangedBy: "seed" },
    { deviceId: "bedroom-light", state: false, location: "ห้องนอน", powerWatts: 30, lastChangedBy: "seed" },
    { deviceId: "bath-fan", state: false, location: "ห้องน้ำ", powerWatts: 40, lastChangedBy: "seed" },
    { deviceId: "bath-light", state: false, location: "ห้องน้ำ", powerWatts: 20, lastChangedBy: "seed" },
    { deviceId: "kitchen-hood", state: false, location: "ห้องครัว", powerWatts: 150, lastChangedBy: "seed" },
    { deviceId: "kitchen-detector", state: true, location: "ห้องครัว", powerWatts: 5, lastChangedBy: "seed" },
    { deviceId: "kitchen-pump", state: false, location: "ห้องครัว", powerWatts: 400, lastChangedBy: "seed" },
    { deviceId: "kitchen-light", state: false, location: "ห้องครัว", powerWatts: 40, lastChangedBy: "seed" },
    { deviceId: "garage-lock", state: true, location: "โรงจอดรถ", powerWatts: 30, lastChangedBy: "seed" },
    { deviceId: "garage-light", state: false, location: "โรงจอดรถ", powerWatts: 60, lastChangedBy: "seed" },
    { deviceId: "living-lock", state: true, location: "ห้องนั่งเล่น", powerWatts: 30, lastChangedBy: "seed" },
    { deviceId: "living-light", state: false, location: "ห้องนั่งเล่น", powerWatts: 60, lastChangedBy: "seed" },
    { deviceId: "bedroom-rack", state: false, location: "นอกบ้าน", powerWatts: 50, lastChangedBy: "seed" },
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
