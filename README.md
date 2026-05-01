# Smart Floor Pal (ระบบพื้นอัจฉริยะ) 🦶✨

Smart Floor Pal คือโปรเจกต์มินิสมาร์ทโฮม (Mini Smart Home) ที่อาศัยการทำงานร่วมกันระหว่าง **แผ่นพื้นอัจฉริยะ (Smart Floor)** ที่เก็บข้อมูลแรงกด และ **Dashboard มอนิเตอร์บนเว็บไซต์** ทำให้ผู้ใช้งานสามารถมองเห็นสถานะการเดินเหยียบ หรือสั่งการเปิด-ปิดเครื่องใช้ไฟฟ้าต่างๆ ภายในบ้านได้แบบ Real-time พร้อมระบบคำนวณค่าไฟอัตโนมัติจากชั่วโมงการใช้งานจริง

---

## 🌟 ฟีเจอร์หลัก (Key Features)

- **Real-time Monitoring**: ดูสถานะอุปกรณ์ภายในบ้านและตำแหน่งการเหยียบบนพื้นได้ทันที
- **Interactive Floor Plan**: แผนผังบ้านแบบ Interactive ที่สามารถคลิกสั่งงานอุปกรณ์ได้
- **Electricity Cost Calculation**: คำนวณค่าไฟแยกตามอุปกรณ์และห้อง โดยอิงจากเวลาที่เปิดใช้งานจริง
- **Hardware Integration**: รองรับการส่งข้อมูลจากบอร์ด ESP32 ผ่าน REST API
- **Automation System**: ระบบตั้งเวลาล่วงหน้าสำหรับอุปกรณ์ต่างๆ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend & Backend**: [TanStack Start](https://tanstack.com/start) (Vite + React)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (NoSQL)
- **Styling**: Tailwind CSS & Lucide Icons
- **Hardware**: ESP32 / Arduino (C++)

---

## 📋 ความต้องการของระบบ (Requirements)

โปรดตรวจสอบสิ่งที่ต้องเตรียม (Hardware, Software, Cloud Services) ทั้งหมดได้ที่นี่:
👉 [**REQUIREMENTS.md (คลิกเพื่ออ่าน)**](./REQUIREMENTS.md)

---

## 🚀 วิธีการติดตั้ง (Installation)

1. **โคลนโปรเจกต์และติดตั้ง Library:**
   ```bash
   npm install
   ```

2. **ตั้งค่า Environment Variables:**
   สร้างไฟล์ `.env` ที่ root folder และใส่ค่าดังนี้:
   ```env
   # การเชื่อมต่อ MongoDB
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=Cluster0"
   MONGODB_DATABASE="smart_floor_pal"

   # รหัสความปลอดภัยสำหรับการรับข้อมูลจาก ESP32
   DEVICE_INGEST_TOKEN="your_secret_token"
   ```

3. **รันโปรเจกต์:**
   ```bash
   npm run dev
   ```
   เข้าชมผ่าน: `http://localhost:5173`

---

## 📡 การเชื่อมต่อ Hardware (ESP32)

คุณสามารถดูโค้ดตัวอย่างสำหรับบอร์ด ESP32 ได้ที่โฟลเดอร์ `esp32_board/`
- ตรวจสอบให้มั่นใจว่า `DEVICE_INGEST_TOKEN` ใน `.env` ตรงกับในโค้ด Arduino
- ระบุ IP Address ของคอมพิวเตอร์ที่รันเซิร์ฟเวอร์ในตัวแปร `serverUrl` ในโค้ด Arduino

---

## 📖 คู่มือสำหรับนักพัฒนา (Developer Guide)

สำหรับนักพัฒนาที่ต้องการแก้ไขโครงสร้างบ้าน เพิ่มอุปกรณ์ หรือแก้ไขระบบคำนวณค่าไฟ โปรดอ่านรายละเอียดเพิ่มเติมที่:
👉 [**DEVELOPER_GUIDE.md (คลิกเพื่ออ่าน)**](./DEVELOPER_GUIDE.md)

---

*พัฒนาด้วย ❤️ เพื่อยกระดับประสบการณ์บ้านอัจฉริยะของคุณ*
