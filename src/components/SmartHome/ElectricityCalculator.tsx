import { Room } from "./types";
import { Zap, Home, Clock, Calendar, CreditCard, TrendingUp } from "lucide-react";

interface Props {
  rooms: Room[];
}

export function ElectricityCalculator({ rooms }: Props) {
  // Calculate total power consumption (Watts)
  const totalWatts = rooms.reduce((total, room) => {
    return total + room.devices.reduce((roomTotal, device) => {
      return roomTotal + (device.state ? (device.powerConsumption || 0) : 0);
    }, 0);
  }, 0);

  const kWh = totalWatts / 1000;
  const ratePerUnit = 4.5; // Example: 4.5 Baht per Unit (kWh)

  const costPerHour = kWh * ratePerUnit;
  const costPerDay = costPerHour * 24;
  const costPerMonth = costPerDay * 30;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          label="ค่าไฟประมาณการ / ชม." 
          value={costPerHour.toFixed(2)} 
          unit="บาท" 
          icon={Clock} 
          gradient="from-blue-500/20 to-cyan-500/20"
          iconColor="text-blue-500"
        />
        <StatCard 
          label="ค่าไฟประมาณการ / วัน" 
          value={costPerDay.toFixed(0)} 
          unit="บาท" 
          icon={Calendar} 
          gradient="from-indigo-500/20 to-purple-500/20"
          iconColor="text-indigo-500"
        />
        <StatCard 
          label="ค่าไฟประมาณการ / เดือน" 
          value={costPerMonth.toLocaleString("th-TH", { maximumFractionDigits: 0 })} 
          unit="บาท" 
          icon={CreditCard} 
          gradient="from-emerald-500/20 to-teal-500/20"
          iconColor="text-emerald-500"
        />
      </div>

      <div className="rounded-2xl border border-border bg-[var(--gradient-card)] p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">รายละเอียดการใช้พลังงาน</h2>
              <p className="text-sm text-muted-foreground">สรุปการใช้ไฟแยกตามแต่ละห้อง</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">รวมทั้งหมดตอนนี้</p>
            <p className="text-2xl font-black text-amber-500">{totalWatts} <span className="text-sm font-normal">W</span></p>
          </div>
        </div>

        <div className="space-y-4">
          {rooms.map((room) => {
            const roomWatts = room.devices.reduce((sum, d) => sum + (d.state ? (d.powerConsumption || 0) : 0), 0);
            const percentage = totalWatts > 0 ? (roomWatts / totalWatts) * 100 : 0;
            
            return (
              <div key={room.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{room.name}</span>
                  </div>
                  <span className="text-muted-foreground">{roomWatts} W ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600/80">
        💡 <strong>เคล็ดลับประหยัดไฟ:</strong> การปิดไฟเมื่อไม่ได้ใช้งานห้องนอน สามารถช่วยลดค่าไฟลงได้ประมาณ {(40 * 24 * 30 / 1000 * ratePerUnit).toFixed(0)} บาทต่อเดือน
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, gradient, iconColor }: any) {
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${gradient} p-5 shadow-sm backdrop-blur-md`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
