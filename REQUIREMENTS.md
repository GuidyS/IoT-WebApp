# 📋 ความต้องการของระบบ (Requirements)

ก่อนเริ่มพัฒนาหรือติดตั้งโปรเจกต์ **SmartHome** คุณต้องเตรียมสิ่งเหล่านี้ให้พร้อม:

---

## 1. ซอฟต์แวร์และเครื่องมือ (Software & Tools)

- **Node.js**: เวอร์ชัน 18.x ขึ้นไป (แนะนำเวอร์ชัน LTS)
- **npm / bun**: สำหรับจัดการแพ็คเกจและรันโปรเจกต์
- **Visual Studio Code**: แนะนำให้ติดตั้ง Extension ต่อไปนี้:
  - `Prettier - Code formatter`
  - `ESLint`
  - `Tailwind CSS IntelliSense`
- **Arduino IDE**: สำหรับคอมไพล์และอัปโหลดโค้ดลงบอร์ด ESP32
  - ต้องติดตั้งบอร์ด Library สำหรับ ESP32
- **MongoDB Compass** (ทางเลือก): สำหรับเปิดดูและจัดการข้อมูลในฐานข้อมูลแบบ GUI

---

## 2. บัญชีบริการ Cloud (Cloud Services)

- **MongoDB Atlas**:
  - สร้าง Cluster (แบบฟรี M0 ก็เพียงพอ)
  - สร้าง Database User และจดจำรหัสผ่านไว้
  - **สำคัญ**: ต้องทำการ Whitelist IP Address ของคุณในส่วน "Network Access" เพื่อให้เชื่อมต่อได้
- **Supabase**: 
  - สร้างโปรเจกต์เพื่อรับ `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
  - ใช้สำหรับระบบ Authentication และจัดการ User

---

## 3. ฮาร์ดแวร์ (Hardware)

- **ไมโครคอนโทรลเลอร์**: บอร์ด ESP32 (เช่น DOIT DevKit V1) หรือ NodeMCU
- **เซนเซอร์และอุปกรณ์เสริม**:
  - สวิตช์ปุ่มกด (Push Button)
  - เซนเซอร์วัดแรงกด (Load Cell + HX711) หรือ Force Sensitive Resistor (FSR)
  - Breadboard และสายจัมเปอร์ (Jumper Wires)
- **การเชื่อมต่อ**: 
  - สาย Micro USB หรือ USB-C สำหรับเชื่อมต่อคอมพิวเตอร์
  - เครือข่าย WiFi 2.4GHz (ESP32 ไม่รองรับ 5GHz)

---

## 4. ความรู้พื้นฐานที่แนะนำ (Prerequisites Knowledge)

- **Frontend**: พื้นฐาน React และ Tailwind CSS
- **Backend**: พื้นฐาน Node.js และ REST API
- **Database**: ความเข้าใจพื้นฐาน NoSQL (MongoDB)
- **Hardware**: พื้นฐานการเขียนโปรแกรมภาษา C++ สำหรับ Arduino
