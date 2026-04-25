import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAutomations,
  createAutomation,
  toggleAutomation,
  deleteAutomation,
} from "@/lib/automations.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Clock, Plus, ArrowLeft, Power } from "lucide-react";
import { useState } from "react";

const ALL_DEVICES = [
  { id: "living-light", label: "ห้องนั่งเล่น • ไฟเพดาน" },
  { id: "living-ac", label: "ห้องนั่งเล่น • แอร์" },
  { id: "living-curtain", label: "ห้องนั่งเล่น • ม่าน" },
  { id: "kitchen-light", label: "ห้องครัว • ไฟ" },
  { id: "kitchen-fan", label: "ห้องครัว • พัดลม" },
  { id: "bedroom-light", label: "ห้องนอน • ไฟหัวเตียง" },
  { id: "bedroom-ac", label: "ห้องนอน • แอร์" },
  { id: "bedroom-lock", label: "ห้องนอน • ประตู" },
  { id: "bath-light", label: "ห้องน้ำ • ไฟ" },
  { id: "garage-light", label: "โรงรถ • ไฟ" },
  { id: "garage-lock", label: "โรงรถ • ประตู" },
];

const DAYS = [
  { v: 0, label: "อา" },
  { v: 1, label: "จ" },
  { v: 2, label: "อ" },
  { v: 3, label: "พ" },
  { v: 4, label: "พฤ" },
  { v: 5, label: "ศ" },
  { v: 6, label: "ส" },
];

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — ตั้งเวลาอัตโนมัติ Smart Home" },
      {
        name: "description",
        content: "ตั้งเวลาเปิดปิดไฟ แอร์ ประตู อัตโนมัติตามวันและเวลาที่กำหนด",
      },
    ],
  }),
  component: AutomationsPage,
});

function AutomationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: () => listAutomations(),
  });

  const [name, setName] = useState("");
  const [time, setTime] = useState("18:00");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [deviceId, setDeviceId] = useState(ALL_DEVICES[0].id);
  const [actionState, setActionState] = useState(true);
  const [temperature, setTemperature] = useState<string>("");

  const createMut = useMutation({
    mutationFn: () =>
      createAutomation({
        data: {
          name: name.trim() || `Schedule ${time}`,
          enabled: true,
          time,
          daysOfWeek: days,
          action: {
            deviceId,
            state: actionState,
            ...(temperature ? { temperature: Number(temperature) } : {}),
          },
        },
      }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["automations"] });
    },
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { id: string; enabled: boolean }) => toggleAutomation({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteAutomation({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const isAcDevice = deviceId.endsWith("-ac");

  return (
    <div className="min-h-screen bg-[var(--gradient-bg)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="mb-8 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
            <p className="text-sm text-muted-foreground">
              ตั้งเวลาอัตโนมัติ • เก็บใน MongoDB • รันตาม schedule (เวลาไทย UTC+7)
            </p>
          </div>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" /> สร้าง Automation ใหม่
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ชื่อ</Label>
                <Input
                  placeholder="เช่น เปิดแอร์ก่อนกลับบ้าน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>เวลา (HH:MM)</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>วันในสัปดาห์</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const active = days.includes(d.v);
                  return (
                    <button
                      key={d.v}
                      type="button"
                      onClick={() => toggleDay(d.v)}
                      className={`h-9 w-12 rounded-md border text-sm transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>อุปกรณ์</Label>
                <Select value={deviceId} onValueChange={setDeviceId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_DEVICES.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>การกระทำ</Label>
                <div className="flex h-10 items-center gap-3 rounded-md border border-border bg-card px-3">
                  <Power className={`h-4 w-4 ${actionState ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className="text-sm">{actionState ? "เปิด" : "ปิด"}</span>
                  <div className="ml-auto">
                    <Switch checked={actionState} onCheckedChange={setActionState} />
                  </div>
                </div>
              </div>
            </div>

            {isAcDevice && actionState && (
              <div className="space-y-2">
                <Label>อุณหภูมิแอร์ (°C) — ไม่บังคับ</Label>
                <Input
                  type="number"
                  min={16}
                  max={30}
                  placeholder="24"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending || days.length === 0}
              className="w-full"
            >
              {createMut.isPending ? "กำลังบันทึก…" : "สร้าง Automation"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายการที่ตั้งไว้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">กำลังโหลด…</p>}
            {data?.error && (
              <p className="text-sm text-destructive">เชื่อมต่อ MongoDB ไม่สำเร็จ: {data.error}</p>
            )}
            {data?.automations.length === 0 && (
              <p className="text-sm text-muted-foreground">ยังไม่มี automation</p>
            )}
            {data?.automations.map((a) => {
              const dev = ALL_DEVICES.find((d) => d.id === a.action.deviceId);
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.time} • {a.daysOfWeek.map((d) => DAYS[d].label).join(" ")} • {dev?.label ?? a.action.deviceId} → {a.action.state ? "เปิด" : "ปิด"}
                      {typeof a.action.temperature === "number" ? ` ${a.action.temperature}°C` : ""}
                    </div>
                  </div>
                  <Switch
                    checked={a.enabled}
                    onCheckedChange={(v) => toggleMut.mutate({ id: a.id, enabled: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => delMut.mutate(a.id)}
                    disabled={delMut.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg border border-border bg-card/40 p-4 text-xs text-muted-foreground">
          💡 Automation จะรันเมื่อมีการเรียก <code className="rounded bg-muted px-1">POST /api/public/automations/tick</code> (ใส่ Bearer token).
          แนะนำให้ตั้ง cron job (เช่น cron-job.org) ยิงเข้ามาทุกๆ 1 นาที
        </div>
      </div>
    </div>
  );
}
