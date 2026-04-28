import { useState, useEffect } from "react";

export function useDeviceSettings() {
  const [curtainIp, setCurtainIp] = useState("192.168.1.50");
  const [rackIp, setRackIp] = useState("172.20.10.3");
  const [mainDoorIp, setMainDoorIp] = useState("192.168.1.51");
  const [garageDoorIp, setGarageDoorIp] = useState("192.168.1.55");
  const [lightIp, setLightIp] = useState("192.168.1.52");
  const [fanIp, setFanIp] = useState("192.168.1.53");
  const [hoodIp, setHoodIp] = useState("192.168.1.54");

  useEffect(() => {
    const savedCurtain = localStorage.getItem("curtainIp");
    const savedRack = localStorage.getItem("rackIp");
    const savedMainDoor = localStorage.getItem("mainDoorIp");
    const savedGarageDoor = localStorage.getItem("garageDoorIp");
    const savedLight = localStorage.getItem("lightIp");
    const savedFan = localStorage.getItem("fanIp");
    const savedHood = localStorage.getItem("hoodIp");
    
    if (savedCurtain) setCurtainIp(savedCurtain);
    if (savedRack) setRackIp(savedRack);
    if (savedMainDoor) setMainDoorIp(savedMainDoor);
    if (savedGarageDoor) setGarageDoorIp(savedGarageDoor);
    if (savedLight) setLightIp(savedLight);
    if (savedFan) setFanIp(savedFan);
    if (savedHood) setHoodIp(savedHood);
  }, []);

  const saveSettings = (newCurtainIp: string, newRackIp: string, newMainDoorIp: string, newGarageDoorIp: string, newLightIp: string, newFanIp: string, newHoodIp: string) => {
    setCurtainIp(newCurtainIp);
    setRackIp(newRackIp);
    setMainDoorIp(newMainDoorIp);
    setGarageDoorIp(newGarageDoorIp);
    setLightIp(newLightIp);
    setFanIp(newFanIp);
    setHoodIp(newHoodIp);
    localStorage.setItem("curtainIp", newCurtainIp);
    localStorage.setItem("rackIp", newRackIp);
    localStorage.setItem("mainDoorIp", newMainDoorIp);
    localStorage.setItem("garageDoorIp", newGarageDoorIp);
    localStorage.setItem("lightIp", newLightIp);
    localStorage.setItem("fanIp", newFanIp);
    localStorage.setItem("hoodIp", newHoodIp);
    
    // Also save as a combined object for easier access
    localStorage.setItem("device-settings", JSON.stringify({
      curtainIp: newCurtainIp,
      rackIp: newRackIp,
      mainDoorIp: newMainDoorIp,
      garageDoorIp: newGarageDoorIp,
      lightIp: newLightIp,
      fanIp: newFanIp,
      hoodIp: newHoodIp
    }));
  };

  return {
    curtainIp,
    rackIp,
    mainDoorIp,
    garageDoorIp,
    lightIp,
    fanIp,
    hoodIp,
    saveSettings,
  };
}
