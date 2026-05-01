# 🛠️ Developer Guide (คู่มือนักพัฒนา)

ยินดีต้อนรับสู่คู่มือเจาะลึกสำหรับนักพัฒนาโปรเจกต์ **Smart Floor Pal** เอกสารฉบับนี้จะช่วยให้คุณเข้าใจโครงสร้างภายใน และสามารถปรับปรุงระบบต่อได้ทันที

---

## 📋 ความต้องการของระบบ (Requirements)
โปรดตรวจสอบสิ่งที่ต้องเตรียมก่อนเริ่มพัฒนาที่นี่: 👉 [**REQUIREMENTS.md (คลิกเพื่ออ่าน)**](./REQUIREMENTS.md)

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)

- `src/routes/`: ระบบ Routing ของ TanStack Start (File-based routing)
- `src/components/`: ส่วนประกอบของ UI (แบ่งเป็น `SmartHome`, `Monitoring` ฯลฯ)
- `src/lib/`: Logic ส่วนกลาง
  - `mongo.server.ts`: Wrapper สำหรับเชื่อมต่อ MongoDB (ฝั่ง Server)
  - `devices.functions.ts`: Server Functions สำหรับดึง/อัปเดตสถานะอุปกรณ์
  - `devices.shared.ts`: Type Definitions ที่ใช้ร่วมกัน
- `esp32_board/`: โค้ดภาษา C++ สำหรับบอร์ด ESP32

---

## 🏠 การปรับแต่งแผนผังบ้าน (Customizing Floor Plan)

หากต้องการเพิ่มห้อง หรือเปลี่ยนตำแหน่งอุปกรณ์ ให้แก้ไขที่ไฟล์:
`src/components/SmartHome/SmartHome.tsx`

ค้นหาตัวแปร `INITIAL_ROOMS` ซึ่งเป็น Array ของ Object:
```tsx
{
  id: "living-room",
  name: "ห้องนั่งเล่น",
  nameEn: "Living Room",
  x: 5, y: 5, width: 40, height: 60, // พิกัดเป็น % ของพื้นที่รวม
  devices: [
    { id: "living-light", type: "light", name: "ไฟเพดาน", state: false, powerConsumption: 30 },
    // powerConsumption หน่วยเป็น Watts (W) ใช้สำหรับคำนวณค่าไฟ
  ],
}
```

---

## ⚡ ระบบคำนวณค่าไฟ (Electricity Calculation)

ระบบจะคำนวณค่าไฟโดยอิงจาก **"ระยะเวลาที่เปิดใช้งานจริง"** ไม่ใช่การสุ่มตัวเลข:

1. เมื่ออุปกรณ์ถูกเปิด (`state: true`) ระบบจะสร้าง Log ใน Collection `device_state_logs` พร้อมบันทึกเวลา `turnedOnAt`
2. เมื่ออุปกรณ์ถูกปิด (`state: false`) ระบบจะอัปเดต Log เดิม บันทึก `turnedOffAt` และคำนวณ `durationHours`
3. **สูตรการคำนวณ**:
   - `Unit (kWh) = (Power (W) * Duration (Hours)) / 1000`
   - `Cost (Baht) = Unit * 4.5` (สามารถปรับเปลี่ยนราคาต่อหน่วยได้ในโค้ด)

---

## 💾 โครงสร้างฐานข้อมูล (Database Schema)

โปรเจกต์นี้ใช้ MongoDB 2 Collection หลัก:

1. **`device_states`**: เก็บสถานะปัจจุบันของอุปกรณ์
   - `deviceId`: string (Unique ID)
   - `state`: boolean
   - `updatedAt`: ISO Date
2. **`device_state_logs`**: เก็บประวัติการใช้งาน
   - `deviceId`: string
   - `turnedOnAt`: ISO Date
   - `turnedOffAt`: ISO Date | null
   - `durationHours`: number

---

## 📡 API สำหรับ Hardware (ESP32)

บอร์ด ESP32 จะสื่อสารผ่าน HTTP REST API:

- **Endpoint**: `POST /api/public/devices/state`
- **Headers**:
  - `Authorization: Bearer <your_token>`
  - `Content-Type: application/json`
- **Body Example**:
  ```json
  {
    "deviceId": "bath-light",
    "state": true,
    "temperature": 28.5
  }
  ```

---

## 🧪 เครื่องมือช่วยทดสอบ (Dev Tools)

เรามีสคริปต์สำหรับจำลองการส่งข้อมูลเข้าฐานข้อมูลโดยไม่ต้องใช้บอร์ดจริง:
1. แก้ไขไฟล์ `test-insert.ts` เพื่อกำหนดข้อมูลที่ต้องการ
2. รันคำสั่ง:
   ```bash
   npx tsx test-insert.ts
   ```

---

## ❓ ปัญหาที่พบบ่อย (Troubleshooting)

- **CORS Error**: หาก ESP32 เชื่อมต่อไม่ได้ ให้เช็คว่า `Access-Control-Allow-Origin` ใน `src/routes/api.public.devices.state.ts` ตั้งค่าไว้ถูกต้อง
- **MongoDB Connection**: ตรวจสอบว่าได้ทำการ Whitelist IP ในหน้า MongoDB Atlas Network Access หรือยัง
- **.env ไม่ทำงาน**: ตรวจสอบว่าได้ใส่เครื่องหมายคำพูดคร่อมค่าที่เว้นวรรคหรือไม่ และต้อง Restart Server ทุกครั้งที่แก้ไข `.env`
