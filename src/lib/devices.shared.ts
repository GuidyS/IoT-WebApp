// Shared device types — safe for both client and server.
export interface DeviceState {
  deviceId: string;
  state: boolean;
  temperature?: number;
  updatedAt: string; // ISO
  source?: "ui" | "esp32" | "automation";
}

export interface Automation {
  _id?: string;
  id: string;
  name: string;
  enabled: boolean;
  // HH:MM 24h
  time: string;
  // 0=Sun .. 6=Sat
  daysOfWeek: number[];
  action: {
    deviceId: string;
    state: boolean;
    temperature?: number;
  };
  lastRunAt?: string;
  createdAt: string;
}
