import { createFileRoute, Link } from "@tanstack/react-router";
import { SmartHome } from "@/components/SmartHome/SmartHome";
import { Home, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Home — แผนผังบ้านอัจฉริยะ Interactive" },
      {
        name: "description",
        content:
          "แผนผังบ้าน 2D แบบโต้ตอบได้ เลือกห้องและควบคุมไฟ แอร์ ประตู แบบเรียลไทม์",
      },
      { property: "og:title", content: "Smart Home — แผนผังบ้านอัจฉริยะ" },
      {
        property: "og:description",
        content: "Interactive 2D Floor Plan with room-specific device controls.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[var(--gradient-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="mb-8 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Smart Home Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              ระบบบ้านอัจฉริยะ • แผนผังโต้ตอบได้แบบเรียลไทม์
            </p>
          </div>
          <Link
            to="/automations"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Clock className="h-4 w-4" /> Automations
          </Link>
        </header>

        <SmartHome />

        <footer className="mt-10 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/40 p-3">
            🔌 <span className="text-foreground">API Ready</span> — พร้อมเชื่อมต่อ MQTT / REST
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-3">
            🔔 <span className="text-foreground">Notifications</span> — แจ้งเตือนเมื่อบุกรุก
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-3">
            ⏱️ <span className="text-foreground">Automations</span> — ตั้งเวลาอัตโนมัติ
          </div>
        </footer>
      </div>
    </div>
  );
}
