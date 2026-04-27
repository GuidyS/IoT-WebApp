import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpDown, CloudRain, ShieldCheck, SunDim } from "lucide-react";
import { toast } from "sonner";

export function Esp32LocalControl() {
  const [curtainIp, setCurtainIp] = useState("192.168.1.50");
  const [rackIp, setRackIp] = useState("172.20.10.3");
  const [rainLevel, setRainLevel] = useState<string | null>(null);

  const handleCommand = async (ip: string, endpoint: string, successMessage: string) => {
    if (!ip) {
      toast.error("กรุณากรอก IP Address ก่อนครับ");
      return;
    }
    
    try {
      const res = await fetch(`http://${ip}${endpoint}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.text();
      toast.success(successMessage || data);
    } catch (error) {
      console.error(error);
      toast.error(`เชื่อมต่อไม่สำเร็จที่ ${ip}: กรุณาตรวจสอบ IP หรือเช็คว่าเครื่องคุณเชื่อมต่อ WiFi วงเดียวกับบอร์ดหรือไม่`);
    }
  };

  const handleCheckRain = async () => {
    // สมมติว่าเซ็นเซอร์น้ำฝนต่ออยู่กับบอร์ดม่าน
    if (!curtainIp) {
      toast.error("กรุณากรอก IP Address ของม่านก่อนครับ");
      return;
    }

    try {
      const res = await fetch(`http://${curtainIp}/rain`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.text();
      setRainLevel(data);
      toast.success(`เช็คระดับน้ำฝนสำเร็จ: ${data}`);
    } catch (error) {
      console.error(error);
      toast.error(`เชื่อมต่อไม่สำเร็จ: เช็ค IP ${curtainIp} อีกครั้ง`);
    }
  };

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          ระบบควบคุมแบบแยกส่วน (Local Network)
        </CardTitle>
        <CardDescription>
          แผงควบคุมระบบม่าน และ ราวตากผ้า ที่ใช้ ESP32 แยกบอร์ดกัน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* ส่วนควบคุมม่าน */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-semibold whitespace-nowrap min-w-[100px] text-primary">🖥️ IP ระบบม่าน:</label>
            <Input 
              value={curtainIp} 
              onChange={(e) => setCurtainIp(e.target.value)} 
              placeholder="เช่น 192.168.1.50"
              className="max-w-[200px] bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleCommand(curtainIp, "/open", "สั่งเปิดม่านแล้ว!")} variant="default">
              <ArrowUpDown className="mr-2 h-4 w-4" /> เปิดม่าน
            </Button>
            <Button onClick={() => handleCommand(curtainIp, "/close", "สั่งปิดม่านแล้ว!")} variant="secondary">
              <ArrowUpDown className="mr-2 h-4 w-4" /> ปิดม่าน
            </Button>
            <Button onClick={handleCheckRain} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <CloudRain className="mr-2 h-4 w-4" /> เช็คระดับน้ำฝน
            </Button>
          </div>
          {rainLevel && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-100 w-fit">
              💦 ระดับน้ำฝนปัจจุบัน: <strong className="text-lg">{rainLevel}</strong>
            </div>
          )}
        </div>

        {/* ส่วนควบคุมราวตากผ้า */}
        <div className="space-y-4 rounded-xl border border-amber-500/20 bg-card p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <SunDim className="w-24 h-24" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-semibold whitespace-nowrap min-w-[100px] text-amber-600">🌤️ IP ราวตากผ้า:</label>
            <Input 
              value={rackIp} 
              onChange={(e) => setRackIp(e.target.value)} 
              placeholder="เช่น 172.20.10.3"
              className="max-w-[200px] bg-background border-amber-200 focus-visible:ring-amber-500"
            />
          </div>
          <div className="flex flex-wrap gap-3 relative z-10">
            <Button onClick={() => handleCommand(rackIp, "/open", "สั่งกางราวตากผ้าแล้ว!")} className="bg-amber-500 hover:bg-amber-600 text-white">
              <SunDim className="mr-2 h-4 w-4" /> กางราวตากผ้า
            </Button>
            <Button onClick={() => handleCommand(rackIp, "/close", "สั่งเก็บราวตากผ้าแล้ว!")} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
              <SunDim className="mr-2 h-4 w-4" /> เก็บราวตากผ้า
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
