import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  currentCurtainIp: string;
  currentRackIp: string;
  currentDoorIp: string;
  onSave: (curtainIp: string, rackIp: string, doorIp: string) => void;
}

export function DeviceSettingsDialog({ currentCurtainIp, currentRackIp, currentDoorIp, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [curtainIp, setCurtainIp] = useState(currentCurtainIp);
  const [rackIp, setRackIp] = useState(currentRackIp);
  const [doorIp, setDoorIp] = useState(currentDoorIp);

  // Sync state when props change
  useEffect(() => {
    setCurtainIp(currentCurtainIp);
    setRackIp(currentRackIp);
    setDoorIp(currentDoorIp);
  }, [currentCurtainIp, currentRackIp, currentDoorIp, open]);

  const handleSave = () => {
    onSave(curtainIp, rackIp, doorIp);
    setOpen(false);
    toast.success("บันทึกการตั้งค่า IP เรียบร้อยแล้ว");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs ml-2">
          <Settings className="mr-1.5 h-3.5 w-3.5" />
          ตั้งค่า IP อุปกรณ์
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ตั้งค่า IP ESP32 (Local Network)</DialogTitle>
          <DialogDescription>
            กำหนด IP ของบอร์ดแต่ละตัว เพื่อให้ระบบสามารถสั่งงานได้ถูกต้อง
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="curtain-ip" className="text-right text-blue-600">
              IP ม่าน
            </Label>
            <Input
              id="curtain-ip"
              value={curtainIp}
              onChange={(e) => setCurtainIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.50"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rack-ip" className="text-right text-amber-600">
              IP ราวตากผ้า
            </Label>
            <Input
              id="rack-ip"
              value={rackIp}
              onChange={(e) => setRackIp(e.target.value)}
              className="col-span-3"
              placeholder="172.20.10.3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="door-ip" className="text-right text-emerald-600">
              IP ประตูบ้าน
            </Label>
            <Input
              id="door-ip"
              value={doorIp}
              onChange={(e) => setDoorIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.51"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>บันทึกการตั้งค่า</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
