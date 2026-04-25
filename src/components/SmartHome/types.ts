export type DeviceType = "light" | "ac" | "lock" | "curtain" | "fan";

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  state: boolean; // on/off, locked/unlocked, open/closed
  temperature?: number; // for AC
}

export interface Room {
  id: string;
  name: string;
  nameEn: string;
  // SVG rect coords (in 100x70 viewBox units)
  x: number;
  y: number;
  width: number;
  height: number;
  devices: Device[];
}
