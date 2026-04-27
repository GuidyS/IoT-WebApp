#include <WiFi.h>
#include <HTTPClient.h>

// ---------------------------------------------------------
// 1. ตั้งค่า Wi-Fi ของบ้านคุณ
// ---------------------------------------------------------
const char* ssid = "ppppp";
const char* password = "importjava";

// ---------------------------------------------------------
// 2. ตั้งค่า Server
// ---------------------------------------------------------
// เปลี่ยนเลข IP ด้านล่างเป็นเลข IP ของเครื่องคอมพิวเตอร์ของคุณ (ดูได้จากการพิมพ์ ipconfig ใน cmd เครื่องคอม)
// ตัวอย่างเช่น http://192.168.1.55:5173/api/public/devices/state
const char* serverUrl = "http://10.255.54.181:5173/api/public/devices/state";

// โทเคนความปลอดภัย ต้องตรงกับในไฟล์ .env (DEVICE_INGEST_TOKEN)
const char* token = "secret_token_1234";

// ---------------------------------------------------------
// 3. ตั้งค่าอุปกรณ์
// ---------------------------------------------------------
// รหัสของแผ่นพื้นชิ้นนี้ (ตั้งให้ตรงกับหน้าเว็บ)
const String deviceId = "floor_pad_1";
// ขาเซนเซอร์แรงกดสวิตช์ (สมมติว่าต่อเข้าขา D2 ของไมโครคอนโทรลเลอร์)
const int sensorPin = 2; 

int previousState = -1;

void setup() {
  Serial.begin(115200);
  pinMode(sensorPin, INPUT_PULLUP);

  // เชื่อมต่อ Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // อ่านค่าจากเซนเซอร์ (สมมติว่าถ้าเหยียบแล้วสวิตช์ลงกราวด์ ค่าจะเป็น LOW)
  int currentState = digitalRead(sensorPin);
  bool isSteppedOn = (currentState == LOW); 

  // ส่งข้อมูลก็ต่อเมื่อสถานะเปลี่ยนไปจากเดิม (เพื่อไม่ให้ส่งข้อมูลซ้ำซ้อนเปลืองเน็ต)
  if (currentState != previousState) {
    previousState = currentState;

    Serial.print("Floor pad state changed to: ");
    Serial.println(isSteppedOn ? "Stepped On (ON)" : "Released (OFF)");

    sendDataToServer(isSteppedOn);
  }

  // หน่วงเวลาเล็กน้อยกันเซนเซอร์แกว่ง (Debounce)
  delay(50);
}

// ---------------------------------------------------------
// ฟังก์ชันส่งข้อมูลไปยังเว็บ (Dashboard)
// ---------------------------------------------------------
void sendDataToServer(bool state) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // เริ่มเตรียมส่งไปที่ URL
    http.begin(serverUrl);
    
    // ใส่ Header บอกเว็บว่าเป็นข้อมูล json และใส่รหัสผ่าน (Token)
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + token);

    // แพ็คข้อมูล json
    // ตรง state: true ส่งแจ้งว่าเหยียบ, false คือไม่ได้เหยียบ
    String jsonPayload = "{\"deviceId\":\"" + deviceId + "\", \"state\":" + (state ? "true" : "false") + "}";

    // ยิงคำสั่ง POST !
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error sending request, code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end(); // ปิดการเชื่อมต่อ
  } else {
    Serial.println("WiFi Disconnected. Cannot send data.");
  }
}