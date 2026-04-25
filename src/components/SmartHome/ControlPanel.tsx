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
} from "lucide-react";

interface Props {
  room: Room;
  onUpdateDevice: (deviceId: string, updates: Partial<Device>) => void;
}

const deviceIcon = {
  light: Lightbulb,
  ac: Snowflake,
  lock: Lock,
  fan: Wind,
  curtain: ArrowUpDown,
};

export function ControlPanel({ room, onUpdateDevice }: Props) {
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
          <DeviceCard key={device.id} device={device} onUpdate={onUpdateDevice} />
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
}: {
  device: Device;
  onUpdate: (id: string, updates: Partial<Device>) => void;
}) {
  const Icon = device.type === "lock" && !device.state ? LockOpen : deviceIcon[device.type];
  const isActive = device.type === "lock" ? device.state : device.state;

  const stateLabel = (() => {
    if (device.type === "lock") return device.state ? "ล็อคอยู่" : "ปลดล็อค";
    return device.state ? "เปิด" : "ปิด";
  })();

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
            variant={device.state ? "secondary" : "destructive"}
            onClick={() => onUpdate(device.id, { state: !device.state })}
          >
            {device.state ? "ปลดล็อค" : "ล็อค"}
          </Button>
        ) : (
          <Switch
            checked={device.state}
            onCheckedChange={(c) => onUpdate(device.id, { state: c })}
          />
        )}
      </div>

      {/* AC temperature controls */}
      {device.type === "ac" && device.state && device.temperature !== undefined && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">อุณหภูมิ</span>
            <span className="text-2xl font-bold text-primary">
              {device.temperature}°C
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                onUpdate(device.id, {
                  temperature: Math.max(16, (device.temperature ?? 24) - 1),
                })
              }
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              value={[device.temperature]}
              min={16}
              max={30}
              step={1}
              onValueChange={(v) => onUpdate(device.id, { temperature: v[0] })}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                onUpdate(device.id, {
                  temperature: Math.min(30, (device.temperature ?? 24) + 1),
                })
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
