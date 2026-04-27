import { useState, useEffect } from "react";

export function useDeviceSettings() {
  const [curtainIp, setCurtainIp] = useState("192.168.1.50");
  const [rackIp, setRackIp] = useState("172.20.10.3");
  const [doorIp, setDoorIp] = useState("192.168.1.51");
  const [lightIp, setLightIp] = useState("192.168.1.52");

  useEffect(() => {
    const savedCurtain = localStorage.getItem("curtainIp");
    const savedRack = localStorage.getItem("rackIp");
    const savedDoor = localStorage.getItem("doorIp");
    const savedLight = localStorage.getItem("lightIp");
    
    if (savedCurtain) setCurtainIp(savedCurtain);
    if (savedRack) setRackIp(savedRack);
    if (savedDoor) setDoorIp(savedDoor);
    if (savedLight) setLightIp(savedLight);
  }, []);

  const saveSettings = (newCurtainIp: string, newRackIp: string, newDoorIp: string, newLightIp: string) => {
    setCurtainIp(newCurtainIp);
    setRackIp(newRackIp);
    setDoorIp(newDoorIp);
    setLightIp(newLightIp);
    localStorage.setItem("curtainIp", newCurtainIp);
    localStorage.setItem("rackIp", newRackIp);
    localStorage.setItem("doorIp", newDoorIp);
    localStorage.setItem("lightIp", newLightIp);
    
    // Also save as a combined object for easier access
    localStorage.setItem("device-settings", JSON.stringify({
      curtainIp: newCurtainIp,
      rackIp: newRackIp,
      doorIp: newDoorIp,
      lightIp: newLightIp
    }));
  };

  return {
    curtainIp,
    rackIp,
    doorIp,
    lightIp,
    saveSettings,
  };
}
