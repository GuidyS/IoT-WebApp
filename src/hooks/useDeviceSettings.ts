import { useState, useEffect } from "react";

export function useDeviceSettings() {
  const [curtainIp, setCurtainIp] = useState("192.168.1.50");
  const [rackIp, setRackIp] = useState("172.20.10.3");
  const [doorIp, setDoorIp] = useState("192.168.1.51");

  useEffect(() => {
    const savedCurtain = localStorage.getItem("curtainIp");
    const savedRack = localStorage.getItem("rackIp");
    const savedDoor = localStorage.getItem("doorIp");
    
    if (savedCurtain) setCurtainIp(savedCurtain);
    if (savedRack) setRackIp(savedRack);
    if (savedDoor) setDoorIp(savedDoor);
  }, []);

  const saveSettings = (newCurtainIp: string, newRackIp: string, newDoorIp: string) => {
    setCurtainIp(newCurtainIp);
    setRackIp(newRackIp);
    setDoorIp(newDoorIp);
    localStorage.setItem("curtainIp", newCurtainIp);
    localStorage.setItem("rackIp", newRackIp);
    localStorage.setItem("doorIp", newDoorIp);
  };

  return {
    curtainIp,
    rackIp,
    doorIp,
    saveSettings,
  };
}
