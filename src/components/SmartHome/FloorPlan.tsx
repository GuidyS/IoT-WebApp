import type { Room } from "./types";
import { Lightbulb, Snowflake, Lock, LockOpen, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export function FloorPlan({ rooms, selectedRoomId, onSelectRoom }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--gradient-card)] p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">แผนผังบ้าน</h2>
          <p className="text-xs text-muted-foreground">คลิกเลือกห้องเพื่อควบคุมอุปกรณ์</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--room-light-on)]" />
          <span className="text-muted-foreground">ออนไลน์</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-background/40 p-2">
        <svg
          viewBox="0 0 100 70"
          className="h-auto w-full"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
        >
          {/* Outer wall */}
          <rect
            x="2"
            y="2"
            width="96"
            height="66"
            rx="2"
            fill="none"
            stroke="var(--room-wall)"
            strokeWidth="0.6"
          />

          {rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const lightOn = room.devices.some((d) => d.type === "light" && d.state);
            const acOn = room.devices.some((d) => d.type === "ac" && d.state);
            const lockDevice = room.devices.find((d) => d.type === "lock");

            return (
              <g
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="cursor-pointer transition-all"
                style={{ transformOrigin: "center" }}
              >
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  rx="1.2"
                  fill={
                    lightOn
                      ? "var(--room-glow)"
                      : isSelected
                        ? "var(--room-floor-active)"
                        : "var(--room-floor)"
                  }
                  stroke={isSelected ? "var(--primary)" : "var(--room-wall)"}
                  strokeWidth={isSelected ? "0.7" : "0.4"}
                  className="transition-all duration-300"
                />

                {/* Light glow effect */}
                {lightOn && (
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    rx="1.2"
                    fill="var(--room-light-on)"
                    opacity="0.12"
                    className="animate-pulse"
                  />
                )}

                {/* Room name */}
                <text
                  x={room.x + room.width / 2}
                  y={room.y + 5}
                  textAnchor="middle"
                  fontSize="2.6"
                  fontWeight="600"
                  fill={lightOn ? "var(--primary-foreground)" : "var(--foreground)"}
                  style={{ pointerEvents: "none" }}
                >
                  {room.name}
                </text>

                {/* Status icons row */}
                <g
                  transform={`translate(${room.x + room.width / 2}, ${room.y + room.height - 4})`}
                  style={{ pointerEvents: "none" }}
                >
                  {(() => {
                    const icons: { Icon: typeof Lightbulb; on: boolean; key: string }[] = [];
                    if (room.devices.some((d) => d.type === "light"))
                      icons.push({ Icon: Lightbulb, on: lightOn, key: "l" });
                    if (room.devices.some((d) => d.type === "ac"))
                      icons.push({ Icon: Snowflake, on: acOn, key: "a" });
                    if (lockDevice)
                      icons.push({
                        Icon: lockDevice.state ? Lock : LockOpen,
                        on: !lockDevice.state,
                        key: "k",
                      });
                    if (room.devices.some((d) => d.type === "fan"))
                      icons.push({
                        Icon: Wind,
                        on: room.devices.find((d) => d.type === "fan")!.state,
                        key: "f",
                      });

                    const spacing = 5;
                    const totalW = (icons.length - 1) * spacing;
                    return icons.map((item, i) => {
                      const cx = -totalW / 2 + i * spacing;
                      return (
                        <foreignObject
                          key={item.key}
                          x={cx - 1.5}
                          y={-1.5}
                          width="3"
                          height="3"
                        >
                          <div
                            className={cn(
                              "flex h-full w-full items-center justify-center rounded-full",
                              item.on
                                ? "text-[var(--room-light-on)]"
                                : "text-muted-foreground/50",
                            )}
                          >
                            <item.Icon style={{ width: "100%", height: "100%" }} />
                          </div>
                        </foreignObject>
                      );
                    });
                  })()}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-[var(--room-light-on)]" /> ไฟเปิด
        </span>
        <span className="flex items-center gap-1.5">
          <Snowflake className="h-3.5 w-3.5 text-accent" /> แอร์
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[var(--status-locked)]" /> ล็อค
        </span>
      </div>
    </div>
  );
}
