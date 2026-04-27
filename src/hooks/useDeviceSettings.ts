import { useState, useEffect } from "react";

export function useDeviceSettings() {
  const [curtainIp, setCurtainIp] = useState("192.168.1.50");
  const [rackIp, setRackIp] = useState("172.20.10.3");

  useEffect(() => {
    const savedCurtain = localStorage.getItem("curtainIp");
    const savedRack = localStorage.getItem("rackIp");
    
    if (savedCurtain) setCurtainIp(savedCurtain);
    if (savedRack) setRackIp(savedRack);
  }, []);

  const saveSettings = (newCurtainIp: string, newRackIp: string) => {
    setCurtainIp(newCurtainIp);
    setRackIp(newRackIp);
    localStorage.setItem("curtainIp", newCurtainIp);
    localStorage.setItem("rackIp", newRackIp);
  };

  return {
    curtainIp,
    rackIp,
    saveSettings,
  };
}
