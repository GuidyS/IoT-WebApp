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

const initialRooms: Room[] = [
  {
    id: "living",
    name: "ห้องนั่งเล่น",
    nameEn: "Living Room",
    x: 4, y: 4, width: 52, height: 32,
    devices: [
<<<<<<< HEAD
      { id: "living-light", type: "light", name: "ไฟเพดาน", state: true, powerConsumption: 60 },
      { id: "living-ac", type: "ac", name: "แอร์", state: true, temperature: 24, powerConsumption: 1000 },
      { id: "living-curtain", type: "curtain", name: "ม่านอัตโนมัติ", state: false, powerConsumption: 10 },
=======
      { id: "living-light", type: "light", name: "ไฟเพดาน", state: true },
      { id: "living-curtain", type: "curtain", name: "ม่านอัตโนมัติ", state: false },
>>>>>>> d1cae33 (Connect ESP)
    ],
  },
  {
    id: "kitchen",
    name: "ห้องครัว",
    nameEn: "Kitchen",
    x: 56, y: 4, width: 40, height: 22,
    devices: [
      { id: "kitchen-light", type: "light", name: "ไฟครัว", state: false, powerConsumption: 40 },
      { id: "kitchen-fan", type: "fan", name: "พัดลมดูดอากาศ", state: false, powerConsumption: 75 },
    ],
  },
  {
    id: "bedroom",
    name: "ห้องนอน",
    nameEn: "Bedroom",
    x: 4, y: 36, width: 36, height: 30,
    devices: [
<<<<<<< HEAD
      { id: "bedroom-light", type: "light", name: "ไฟหัวเตียง", state: false, powerConsumption: 30 },
      { id: "bedroom-ac", type: "ac", name: "แอร์", state: false, temperature: 26, powerConsumption: 800 },
      { id: "bedroom-lock", type: "lock", name: "ประตูห้องนอน", state: true, powerConsumption: 0 },
=======
      { id: "bedroom-light", type: "light", name: "ไฟหัวเตียง", state: false },
      { id: "bedroom-rack", type: "rack", name: "ราวตากผ้า", state: false },
      { id: "bedroom-lock", type: "lock", name: "ประตูห้องนอน", state: true },
>>>>>>> d1cae33 (Connect ESP)
    ],
  },
  {
    id: "bathroom",
    name: "ห้องน้ำ",
    nameEn: "Bathroom",
    x: 40, y: 36, width: 16, height: 18,
    devices: [
      { id: "bath-light", type: "light", name: "ไฟห้องน้ำ", state: false, powerConsumption: 20 },
    ],
  },
  {
    id: "garage",
    name: "โรงรถ",
    nameEn: "Garage",
    x: 56, y: 26, width: 40, height: 40,
    devices: [
      { id: "garage-light", type: "light", name: "ไฟโรงรถ", state: false, powerConsumption: 100 },
      { id: "garage-lock", type: "lock", name: "ประตูโรงรถ", state: true, powerConsumption: 0 },
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

type TabId = "floorplan" | "electricity";

export function SmartHome() {
  const qc = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("living");
  const [localRooms, setLocalRooms] = useState<Room[]>(initialRooms);
  const [activeTab, setActiveTab] = useState<TabId>("floorplan");

  const { curtainIp, rackIp, doorIp, saveSettings } = useDeviceSettings();

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
    if (deviceId === "living-curtain" && updates.state !== undefined) {
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
    if ((deviceId === "bedroom-lock" || deviceId === "garage-lock") && updates.state !== undefined) {
      // For lock: state true = locked (close), state false = unlocked (open)
      fetch(`http://${doorIp}${updates.state ? "/close" : "/open"}`)
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

  const tabs: { id: TabId; label: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: "floorplan",
      label: "แผนผังบ้าน",
      labelEn: "Floor Plan",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
    {
      id: "electricity",
      label: "ค่าไฟฟ้า",
      labelEn: "Electricity",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status bar */}
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
        <DeviceSettingsDialog currentCurtainIp={curtainIp} currentRackIp={rackIp} currentDoorIp={doorIp} onSave={saveSettings} />

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
              : "🌱 Seed test data (เพิ่ม columns ใหม่)"}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="relative flex items-center gap-1 rounded-2xl border border-border bg-card/60 p-1.5 shadow-[var(--shadow-card)] backdrop-blur-sm">
        {/* Animated sliding indicator */}
        <div
          className="absolute bottom-1.5 top-1.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            background: "var(--gradient-primary)",
            left: activeTab === "floorplan" ? "6px" : "calc(50% + 3px)",
            width: "calc(50% - 9px)",
            boxShadow: "0 4px 20px oklch(0.78 0.18 75 / 0.4)",
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200"
            style={{
              color: activeTab === tab.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="hidden text-xs opacity-70 sm:inline">· {tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="transition-all duration-300"
        style={{ animation: "fadeSlideIn 0.3s ease forwards" }}
      >
        {activeTab === "floorplan" && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <FloorPlan rooms={localRooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
            <ControlPanel room={selectedRoom} onUpdateDevice={updateDevice} curtainIp={curtainIp} doorIp={doorIp} />
          </div>
        )}

        {activeTab === "electricity" && (
          <ElectricityCalculator rooms={localRooms} />
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
