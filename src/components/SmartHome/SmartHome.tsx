import { useEffect, useState } from "react";
import type { Room, Device } from "./types";
import { FloorPlan } from "./FloorPlan";
import { ControlPanel } from "./ControlPanel";
import { ElectricityCalculator } from "./ElectricityCalculator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeviceStates, setDeviceState } from "@/lib/devices.functions";
import { seedDeviceStates } from "@/lib/test.functions";
import { Loader2, Wifi, WifiOff, Sprout, LayoutGrid, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeviceSettings } from "@/hooks/useDeviceSettings";
import { DeviceSettingsDialog } from "./DeviceSettingsDialog";
import { toast } from "sonner";

const initialRooms: Room[] = [
  {
    id: "bedroom",
    name: "ห้องนอน",
    nameEn: "Bedroom",
    x: 20, y: 5, width: 28, height: 30,
    devices: [
      { id: "bedroom-curtain", type: "curtain", name: "ผ้าม่าน", state: false, powerConsumption: 10 },
      { id: "bedroom-light", type: "light", name: "ไฟห้องนอน", state: false, powerConsumption: 30 },
    ],
  },
  {
    id: "bathroom",
    name: "ห้องน้ำ",
    nameEn: "Bathroom",
    x: 48, y: 5, width: 22, height: 30,
    devices: [
      { id: "bath-fan", type: "fan", name: "พัดลมดูดอากาศ", state: false, powerConsumption: 40 },
      { id: "bath-light", type: "light", name: "ไฟห้องน้ำ", state: false, powerConsumption: 20 },
    ],
  },
  {
    id: "kitchen",
    name: "ห้องครัว",
    nameEn: "Kitchen",
    x: 70, y: 5, width: 25, height: 30,
    devices: [
      { id: "kitchen-hood", type: "hood", name: "ที่ดูดควัน", state: false, powerConsumption: 150 },
      { id: "kitchen-detector", type: "detector", name: "ที่ตรวจวัดควัน", state: true, powerConsumption: 5 },
      { id: "kitchen-pump", type: "pump", name: "ปั๊มน้ำ", state: false, powerConsumption: 400 },
      { id: "kitchen-light", type: "light", name: "ไฟครัว", state: false, powerConsumption: 40 },
    ],
  },
  {
    id: "garage",
    name: "โรงจอดรถ",
    nameEn: "Garage",
    x: 20, y: 35, width: 28, height: 30,
    devices: [
      { id: "garage-lock", type: "lock", name: "ประตูโรงจอดรถ", state: true, powerConsumption: 0 },
      { id: "garage-light", type: "light", name: "ไฟโรงรถ", state: false, powerConsumption: 60 },
    ],
  },
  {
    id: "living",
    name: "ห้องนั่งเล่น",
    nameEn: "Living Room",
    x: 48, y: 35, width: 47, height: 30,
    devices: [
      { id: "living-lock", type: "lock", name: "ประตูเข้าบ้าน", state: true, powerConsumption: 0 },
      { id: "living-light", type: "light", name: "ไฟนั่งเล่น", state: false, powerConsumption: 60 },
    ],
  },
  {
    id: "outside",
    name: "นอกบ้าน",
    nameEn: "Outside",
    x: 4, y: 5, width: 14, height: 15,
    devices: [
      { id: "bedroom-rack", type: "rack", name: "ราวตากผ้า", state: false, powerConsumption: 50 },
    ],
  },
];

function applyStates(rooms: Room[], states: Array<{ deviceId: string; state: boolean; temperature?: number }>) {
  const map = new Map(states.map((s) => [s.deviceId, s]));
  return rooms.map((r) => ({
    ...r,
    devices: r.devices.map((d) => {
      const s = map.get(d.id);
      if (!s) return d;
      return {
        ...d,
        state: s.state,
        ...(typeof s.temperature === "number" ? { temperature: s.temperature } : {}),
      };
    }),
  }));
}

export function SmartHome() {
  const qc = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("living");
  const [localRooms, setLocalRooms] = useState<Room[]>(initialRooms);
  const [activeTab, setActiveTab] = useState<"floor" | "electricity">("floor");

  const { curtainIp, rackIp, doorIp, lightIp, saveSettings } = useDeviceSettings();

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["device-states"],
    queryFn: () => getDeviceStates(),
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (data?.states && data.states.length > 0) {
      setLocalRooms((prev) => applyStates(prev, data.states));
    }
  }, [dataUpdatedAt, data?.states]);

  const mutation = useMutation({
    mutationFn: (vars: { deviceId: string; state: boolean; temperature?: number }) =>
      setDeviceState({ data: { ...vars, source: "ui" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["device-states"] }),
  });

  const selectedRoom = localRooms.find((r) => r.id === selectedRoomId)!;

  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    setLocalRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoomId
          ? { ...room, devices: room.devices.map((d) => (d.id === deviceId ? { ...d, ...updates } : d)) }
          : room,
      ),
    );
    const device = selectedRoom.devices.find((d) => d.id === deviceId);
    if (!device) return;
    const next = { ...device, ...updates };

    // --- Local ESP32 Integration ---
    if (deviceId === "bedroom-curtain" && updates.state !== undefined) {
      fetch(`http://${curtainIp}${updates.state ? "/stepper/open" : "/stepper/close"}`)
        .then(res => { if (!res.ok) throw new Error("Status " + res.status); })
        .catch(e => {
          console.error("Curtain Error:", e);
          toast.error(`ส่งคำสั่งม่านไม่สำเร็จ (IP: ${curtainIp}) - โปรดเช็ควง LAN หรือ IP`);
        });
    }
    if (deviceId === "bedroom-rack" && updates.state !== undefined) {
      fetch(`http://${rackIp}${updates.state ? "/servo/open" : "/servo/close"}`)
        .then(res => { if (!res.ok) throw new Error("Status " + res.status); })
        .catch(e => {
          console.error("Rack Error:", e);
          toast.error(`ส่งคำสั่งราวตากผ้าไม่สำเร็จ (IP: ${rackIp}) - โปรดเช็ควง LAN หรือ IP`);
        });
    }

    // --- Light Control Integration ---
    const lightMapping: Record<string, number> = {
      "bedroom-light": 5,
      "bath-light": 18,
      "kitchen-light": 19,
      "garage-light": 21,
      "living-light": 22
    };

    if (lightMapping[deviceId] && updates.state !== undefined) {
      const pin = lightMapping[deviceId];
      const state = updates.state ? 1 : 0;
      const { lightIp } = JSON.parse(localStorage.getItem("device-settings") || "{}");
      
      if (lightIp) {
        fetch(`http://${lightIp}/set?pin=${pin}&state=${state}`)
          .then(res => { if (!res.ok) throw new Error("Status " + res.status); })
          .catch(e => {
            console.error("Light Error:", e);
            toast.error(`ส่งคำสั่งไฟไม่สำเร็จ (IP: ${lightIp}) - โปรดเช็ควง LAN หรือ IP`);
          });
      }
    }
    if ((deviceId === "living-lock" || deviceId === "garage-lock") && updates.state !== undefined) {
      // state: true = Open, state: false = Closed
      fetch(`http://${doorIp}${updates.state ? "/open" : "/close"}`)
        .then(res => { if (!res.ok) throw new Error("Status " + res.status); })
        .catch(e => {
          console.error("Door Error:", e);
          toast.error(`ส่งคำสั่งประตูไม่สำเร็จ (IP: ${doorIp}) - โปรดตรวจสอบว่าใส่ CORS ในบอร์ดแล้ว`);
        });
    }

    mutation.mutate({
      deviceId,
      state: next.state,
      temperature: next.temperature,
    });
  };

  const synced = !isError && !!data && !data.error;

  const seedMut = useMutation({
    mutationFn: () => seedDeviceStates(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["device-states"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>กำลังเชื่อมต่อ MongoDB…</span>
            </>
          ) : synced ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                ซิงก์กับ ESP32 (อัปเดตล่าสุด {new Date(dataUpdatedAt).toLocaleTimeString("th-TH")})
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
              <span>ออฟไลน์ — ใช้ค่าเริ่มต้น ({data?.error ?? "no data"})</span>
            </>
          )}
          <DeviceSettingsDialog currentCurtainIp={curtainIp} currentRackIp={rackIp} currentDoorIp={doorIp} currentLightIp={lightIp} onSave={saveSettings} />

          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-7 text-xs"
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
          >
            <Sprout className="h-3.5 w-3.5" />
            {seedMut.isPending
              ? "กำลังเขียน…"
              : seedMut.data
                ? `เพิ่มแล้ว ${seedMut.data.count} แถว ✓`
                : "🌱 Seed test data"}
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 p-1 backdrop-blur-md">
          <Button 
            variant={activeTab === "floor" ? "default" : "ghost"} 
            size="sm" 
            className="h-8 rounded-lg gap-2"
            onClick={() => setActiveTab("floor")}
          >
            <LayoutGrid className="h-4 w-4" />
            แผนผังบ้าน
          </Button>
          <Button 
            variant={activeTab === "electricity" ? "default" : "ghost"} 
            size="sm" 
            className="h-8 rounded-lg gap-2"
            onClick={() => setActiveTab("electricity")}
          >
            <Zap className="h-4 w-4" />
            คำนวณค่าไฟ
          </Button>
        </div>
      </div>

      {activeTab === "floor" ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <FloorPlan rooms={localRooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
          <ControlPanel room={selectedRoom} onUpdateDevice={updateDevice} curtainIp={curtainIp} doorIp={doorIp} />
        </div>
      ) : (
        <ElectricityCalculator rooms={localRooms} />
      )}
    </div>
  );
}
