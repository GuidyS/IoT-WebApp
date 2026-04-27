#include <WiFi.h>
#include <HTTPClient.h>
#include <AccelStepper.h>

// 1. ตั้งค่า Wi-Fi
const char* ssid = "18-401_2.4G";
const char* password = "1111100000";

// 2. ตั้งค่า Web App (เปลี่ยนเลข IP ให้เป็นเลข IP ของเครื่องคอมพิวเตอร์ของคุณ)
// ตัวอย่าง: http://192.168.1.55:5173/api/public/devices/state
const char* serverUrl = "http://10.255.54.181:5173/api/public/devices/state";

// โทเคนความปลอดภัย ต้องตรงกับในไฟล์ .env (DEVICE_INGEST_TOKEN)
const char* token = "secret_token_1234";

// 3. ตั้งค่า ID อุปกรณ์ (ตั้งให้ตรงกับที่ปรากฏบนหน้าเว็บ Dashboard)
const String deviceId = "living-curtain"; 

// 4. ตั้งค่าขา Stepper Motor (IN1, IN3, IN2, IN4)
// ลำดับขาสำหรับ ULN2003: IN1, IN3, IN2, IN4
#define IN1 13
#define IN2 12
#define IN3 14
#define IN4 27
AccelStepper stepper(AccelStepper::FULL4WIRE, IN1, IN3, IN2, IN4);

bool lastState = false; 
unsigned long lastCheckTime = 0;
const int checkInterval = 2000; // ตรวจสอบคำสั่งจากเว็บทุกๆ 2 วินาที

void setup() {
  Serial.begin(115200);

  // เชื่อมต่อ Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // ตั้งค่าความเร็วมอเตอร์
  stepper.setMaxSpeed(800.0);
  stepper.setAcceleration(200.0);
}

void loop() {
  // ต้องรัน stepper.run() ตลอดเวลาเพื่อให้มอเตอร์หมุนได้ลื่นไหล
  stepper.run(); 

  // ตรวจสอบคำสั่งจากเว็บตามช่วงเวลาที่กำหนด
  if (millis() - lastCheckTime > checkInterval) {
    checkWebCommand();
    lastCheckTime = millis();
  }
}

void checkWebCommand() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // เริ่มเตรียมส่งไปที่ URL
    http.begin(serverUrl);
    
    // ใส่ Header บอกรหัสผ่าน (Token)
    http.addHeader("Authorization", String("Bearer ") + token);
    
    // ใช้ GET เพื่ออ่านสถานะปัจจุบันจาก Server
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      
      // ตรวจสอบสถานะของ deviceId นี้ใน JSON ที่ส่งกลับมา
      // มองหา deviceId ของเรา และเช็คค่า state ว่าเป็น true (เปิด) หรือ false (ปิด)
      if (payload.indexOf("\"deviceId\":\"" + deviceId + "\",\"state\":true") != -1) {
        if (lastState == false) {
          Serial.println("Dashboard Command: OPEN Curtain");
          stepper.moveTo(-12288); // สั่งหมุนไปที่ตำแหน่งเปิด
          lastState = true;
        }
      } 
      else if (payload.indexOf("\"deviceId\":\"" + deviceId + "\",\"state\":false") != -1) {
        if (lastState == true) {
          Serial.println("Dashboard Command: CLOSE Curtain");
          stepper.moveTo(0); // สั่งหมุนกลับไปที่ตำแหน่งปิด (0)
          lastState = false;
        }
      }
    } else {
      Serial.print("Error fetching command, code: ");
      Serial.println(httpCode);
    }
    
    http.end(); // ปิดการเชื่อมต่อ
  } else {
    Serial.println("WiFi Disconnected. Cannot fetch data.");
  }
}