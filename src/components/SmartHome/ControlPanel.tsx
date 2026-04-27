import type { Room, Device } from "./types";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Snowflake,
  Lock,
  LockOpen,
  Wind,
  ArrowUpDown,
  Minus,
  Plus,
  SunDim,
  CloudRain,
  UserCheck,
  AlertTriangle,
  Droplets,
  Fan
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  room: Room;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
  curtainIp?: string;
  doorIp?: string;
}

const deviceIcon = {
  light: Lightbulb,
  ac: Snowflake,
  lock: Lock,
  fan: Wind,
  curtain: ArrowUpDown,
  rack: SunDim,
  hood: Fan,
  detector: AlertTriangle,
  pump: Droplets,
};

export function ControlPanel({ room, onUpdateDevice, curtainIp, doorIp }: Props) {
  const activeCount = room.devices.filter((d) => {
    if (d.type === "lock") return !d.state; // unlocked = "active warning"
    return d.state;
  }).length;

  return (
    <div className="rounded-2xl border border-border bg-[var(--gradient-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            กำลังควบคุม
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{room.name}</h2>
          <p className="text-sm text-muted-foreground">{room.nameEn}</p>
        </div>
        <div className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          {room.devices.length} อุปกรณ์
        </div>
      </div>

      <div className="space-y-3">
        {room.devices.map((device) => (
          <DeviceCard key={device.id} device={device} onUpdate={onUpdateDevice} curtainIp={curtainIp} doorIp={doorIp} />
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
        💡 มี <span className="font-semibold text-primary">{activeCount}</span>{" "}
        อุปกรณ์ที่ทำงาน/ต้องสนใจในห้องนี้
      </div>
    </div>
  );
}

function DeviceCard({
  device,
  onUpdate,
  curtainIp,
  doorIp,
}: {
  device: Device;
  onUpdate: (id: string, updates: Partial<Device>) => void;
  curtainIp?: string;
  doorIp?: string;
}) {
  const Icon = device.type === "lock" && !device.state ? LockOpen : deviceIcon[device.type];
  const isActive = device.type === "lock" ? device.state : device.state;
  const [rainLevel, setRainLevel] = useState<string | null>(null);
  const [rfidLog, setRfidLog] = useState<{name: string, role: string, timestamp: string, status: string} | null>(null);

  const stateLabel = (() => {
    if (device.type === "lock") return device.state ? "เปิดอยู่" : "ปิดสนิท";
    if (device.type === "rack") return device.state ? "กางอยู่" : "พับเก็บ";
    if (device.type === "detector") return device.state ? "เปิดการตรวจจับ" : "ปิดการตรวจจับ";
    return device.state ? "เปิด" : "ปิด";
  })();

  const handleCheckRain = async () => {
    try {
      const ip = curtainIp || "192.168.1.50";
      const res = await fetch(`http://${ip}/rain`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.text();
      setRainLevel(data);
      toast.success(`เช็คระดับน้ำฝนสำเร็จ: ${data}`);
    } catch (error) {
      toast.error(`ไม่สามารถเช็คระดับน้ำฝนได้ ตรวจสอบว่าบอร์ดเปิดอยู่ หรือ IP ถูกต้อง`);
    }
  };

  const handleCheckLogs = async () => {
    try {
      const ip = doorIp || "192.168.1.51";
      const res = await fetch(`http://${ip}/logs`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setRfidLog(data);
      toast.success(`ดึงข้อมูลสแกนบัตรสำเร็จ`);
    } catch (error) {
      toast.error(`ดึงข้อมูลสแกนบัตรไม่ได้ ลองเช็ค CORS และ IP ของประตูดูครับ`);
    }
  };

  return (
    <div
      className="rounded-xl border border-border bg-card/60 p-4 transition-all"
      style={{
        boxShadow: device.state && device.type !== "lock" ? "var(--shadow-glow)" : undefined,
        borderColor: device.state && device.type !== "lock" ? "var(--primary)" : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{
              background:
                device.state && device.type !== "lock"
                  ? "var(--gradient-primary)"
                  : "var(--secondary)",
              color:
                device.state && device.type !== "lock"
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{device.name}</p>
            <p className="text-xs text-muted-foreground">{stateLabel}</p>
          </div>
        </div>

        {device.type === "lock" ? (
          <Button
            size="sm"
            variant={device.state ? "secondary" : "default"}
            onClick={() => onUpdate(device.id, { state: !device.state })}
          >
            {device.state ? "ปิดประตู" : "เปิดประตู"}
          </Button>
        ) : (
          <Switch
            checked={device.state}
            onCheckedChange={(c) => onUpdate(device.id, { state: c })}
          />
        )}
      </div>

      {device.type === "curtain" && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={handleCheckRain} className="text-xs text-blue-500 hover:text-blue-600">
              <CloudRain className="mr-2 h-3.5 w-3.5" /> เช็คระดับน้ำฝน
            </Button>
            {rainLevel && <span className="text-xs font-semibold text-blue-600">{rainLevel}</span>}
          </div>
        </div>
      )}

      {device.type === "lock" && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={handleCheckLogs} className="text-xs text-emerald-600 hover:text-emerald-700 w-full sm:w-auto">
                <UserCheck className="mr-2 h-3.5 w-3.5" /> ตรวจสอบประวัติสแกนบัตร (RFID)
              </Button>
            </div>
            {rfidLog && (
              <div className="rounded-lg bg-secondary/50 p-3 text-xs mt-1">
                <div className="flex justify-between border-b border-border/50 pb-1 mb-1">
                  <span className="text-muted-foreground">ชื่อผู้สแกน:</span>
                  <span className="font-semibold text-foreground">{rfidLog.name} ({rfidLog.role})</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1 mb-1">
                  <span className="text-muted-foreground">สถานะ:</span>
                  <span className={`font-semibold ${rfidLog.status === "Granted" ? "text-emerald-500" : "text-destructive"}`}>
                    {rfidLog.status === "Granted" ? "อนุญาตให้เข้า" : "ไม่อนุญาต"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เวลา:</span>
                  <span className="text-foreground">{rfidLog.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
