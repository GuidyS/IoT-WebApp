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
  currentMainDoorIp: string;
  currentGarageDoorIp: string;
  currentLightIp: string;
  currentFanIp: string;
  currentHoodIp: string;
  onSave: (curtainIp: string, rackIp: string, mainDoorIp: string, garageDoorIp: string, lightIp: string, fanIp: string, hoodIp: string) => void;
}

export function DeviceSettingsDialog({ currentCurtainIp, currentRackIp, currentMainDoorIp, currentGarageDoorIp, currentLightIp, currentFanIp, currentHoodIp, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [curtainIp, setCurtainIp] = useState(currentCurtainIp);
  const [rackIp, setRackIp] = useState(currentRackIp);
  const [mainDoorIp, setMainDoorIp] = useState(currentMainDoorIp);
  const [garageDoorIp, setGarageDoorIp] = useState(currentGarageDoorIp);
  const [lightIp, setLightIp] = useState(currentLightIp);
  const [fanIp, setFanIp] = useState(currentFanIp);
  const [hoodIp, setHoodIp] = useState(currentHoodIp);

  // Sync state when props change
  useEffect(() => {
    setCurtainIp(currentCurtainIp);
    setRackIp(currentRackIp);
    setMainDoorIp(currentMainDoorIp);
    setGarageDoorIp(currentGarageDoorIp);
    setLightIp(currentLightIp);
    setFanIp(currentFanIp);
    setHoodIp(currentHoodIp);
  }, [currentCurtainIp, currentRackIp, currentMainDoorIp, currentGarageDoorIp, currentLightIp, currentFanIp, currentHoodIp, open]);

  const handleSave = () => {
    onSave(curtainIp, rackIp, mainDoorIp, garageDoorIp, lightIp, fanIp, hoodIp);
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
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
            <Label htmlFor="main-door-ip" className="text-right text-emerald-600">
              IP ประตูบ้าน
            </Label>
            <Input
              id="main-door-ip"
              value={mainDoorIp}
              onChange={(e) => setMainDoorIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.51"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="garage-door-ip" className="text-right text-emerald-700">
              IP ประตูโรงรถ
            </Label>
            <Input
              id="garage-door-ip"
              value={garageDoorIp}
              onChange={(e) => setGarageDoorIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.55"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="light-ip" className="text-right text-yellow-600">
              IP บอร์ดไฟ
            </Label>
            <Input
              id="light-ip"
              value={lightIp}
              onChange={(e) => setLightIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.52"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fan-ip" className="text-right text-cyan-600">
              IP พัดลม
            </Label>
            <Input
              id="fan-ip"
              value={fanIp}
              onChange={(e) => setFanIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.53"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hood-ip" className="text-right text-orange-600">
              IP ที่ดูดควัน
            </Label>
            <Input
              id="hood-ip"
              value={hoodIp}
              onChange={(e) => setHoodIp(e.target.value)}
              className="col-span-3"
              placeholder="192.168.1.54"
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
