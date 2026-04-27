import { Room } from "./types";
import { Zap, Home, TrendingUp, Cpu, RefreshCw, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDeviceUsageStats } from "@/lib/devices.functions";

interface Props {
  rooms: Room[];
}

export function ElectricityCalculator({ rooms }: Props) {
  const ratePerUnit = 4.5; // Baht per Unit (kWh)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["device-usage-stats"],
    queryFn: async () => {
      const res = await getDeviceUsageStats();
      if (res.error) throw new Error(res.error);
      return res.stats;
    },
    refetchInterval: 10000, // Refetch every 10s for real-time updates
  });

  const stats = data || {};
  let totalHouseCost = 0;
  let totalHouseWattsUsed = 0; // Total energy consumed in Wh

  // Calculate costs and enrich room data
  const enrichedRooms = rooms.map((room) => {
    let roomCost = 0;
    let roomEnergyWh = 0;

    const enrichedDevices = room.devices.map((device) => {
      const hoursUsed = stats[device.id] || 0;
      const powerW = device.powerConsumption || 0;
      const energyWh = powerW * hoursUsed;
      const energyKWh = energyWh / 1000;
      const cost = energyKWh * ratePerUnit;

      roomCost += cost;
      roomEnergyWh += energyWh;

      return { ...device, hoursUsed, cost, energyWh };
    });

    totalHouseCost += roomCost;
    totalHouseWattsUsed += roomEnergyWh;

    return { ...room, devices: enrichedDevices, cost: roomCost, energyWh: roomEnergyWh };
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center animate-pulse">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-destructive h-40">
        <AlertCircle className="h-8 w-8" />
        <p>ไม่สามารถโหลดข้อมูลการใช้ไฟได้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Total House Cost Overview */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 shadow-[var(--shadow-card)] backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600">
              <Zap className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">ค่าไฟสะสมรวมทั้งบ้าน</h2>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground">{totalHouseCost.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-lg font-medium text-muted-foreground">บาท</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">ใช้พลังงานไปแล้ว</p>
            <p className="text-xl font-bold text-amber-600">{(totalHouseWattsUsed / 1000).toFixed(2)} kWh</p>
          </div>
        </div>
      </div>

      {/* Breakdown by Room */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          สรุปค่าไฟแยกตามห้อง
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {enrichedRooms.map((room) => {
            if (room.cost === 0 && room.devices.length > 0) {
              // Optionally hide rooms with 0 cost, but showing them is better for clarity
            }
            return (
              <div key={room.id} className="rounded-xl border border-border bg-[var(--gradient-card)] p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground text-lg">{room.name}</span>
                  </div>
                  <span className="font-bold text-amber-500">{room.cost.toFixed(2)} บาท</span>
                </div>
                
                <div className="space-y-3">
                  {room.devices.map((device) => (
                    <div key={device.id} className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground/60" />
                          <span className="text-foreground">{device.name}</span>
                        </div>
                        <span className="font-medium">{device.cost.toFixed(2)} บาท</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
                        <span>เปิดใช้งาน: {device.hoursUsed > 0 ? (device.hoursUsed).toFixed(1) : "0"} ชม.</span>
                        <span>{(device.energyWh / 1000).toFixed(2)} kWh</span>
                      </div>
                    </div>
                  ))}
                  {room.devices.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">ไม่มีอุปกรณ์กินไฟในห้องนี้</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600/80">
        💡 <strong>หมายเหตุ:</strong> ระบบจะคำนวณค่าไฟจากการเปิดใช้งานจริง โดยบันทึกระยะเวลาเปิด-ปิด ของอุปกรณ์แต่ละชิ้น อ้างอิงค่าไฟเฉลี่ยที่ {ratePerUnit} บาท/หน่วย
      </div>
    </div>
  );
}
