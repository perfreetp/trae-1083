import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Device,
  Battery,
  FlightRecord,
  MaintenanceTask,
  Ticket,
  SparePart,
  Alert,
  CostRecord,
  Depreciation,
} from "@/types";
import {
  mockDevices,
  mockBatteries,
  mockFlightRecords,
  mockMaintenanceTasks,
  mockTickets,
  mockSpareParts,
  mockAlerts,
  mockCostRecords,
  mockDepreciations,
} from "@/data/mockData";

interface AppState {
  devices: Device[];
  batteries: Battery[];
  flightRecords: FlightRecord[];
  maintenanceTasks: MaintenanceTask[];
  tickets: Ticket[];
  spareParts: SparePart[];
  alerts: Alert[];
  costRecords: CostRecord[];
  depreciations: Depreciation[];
  
  addDevice: (device: Omit<Device, "id">) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  addFlightRecord: (record: Omit<FlightRecord, "id">) => void;
  addMaintenanceTask: (task: Omit<MaintenanceTask, "id">) => void;
  updateMaintenanceTask: (id: string, task: Partial<MaintenanceTask>) => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  updateSparePartStock: (id: string, quantity: number, type: "in" | "out") => void;
  addCostRecord: (record: Omit<CostRecord, "id">) => void;
  setDeviceStatus: (id: string, status: Device["status"]) => void;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      devices: mockDevices,
      batteries: mockBatteries,
      flightRecords: mockFlightRecords,
      maintenanceTasks: mockMaintenanceTasks,
      tickets: mockTickets,
      spareParts: mockSpareParts,
      alerts: mockAlerts,
      costRecords: mockCostRecords,
      depreciations: mockDepreciations,

      addDevice: (device) =>
        set((state) => ({
          devices: [...state.devices, { ...device, id: generateId("dev") }],
        })),

      updateDevice: (id, device) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, ...device } : d
          ),
        })),

      addFlightRecord: (record) =>
        set((state) => ({
          flightRecords: [
            { ...record, id: generateId("flight") },
            ...state.flightRecords,
          ],
          devices: state.devices.map((d) =>
            d.id === record.deviceId
              ? { ...d, totalFlightHours: d.totalFlightHours + record.duration }
              : d
          ),
        })),

      addMaintenanceTask: (task) =>
        set((state) => ({
          maintenanceTasks: [
            { ...task, id: generateId("maint") },
            ...state.maintenanceTasks,
          ],
        })),

      updateMaintenanceTask: (id, task) =>
        set((state) => ({
          maintenanceTasks: state.maintenanceTasks.map((t) =>
            t.id === id ? { ...t, ...task } : t
          ),
        })),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [{ ...ticket, id: generateId("tk") }, ...state.tickets],
        })),

      updateTicket: (id, ticket) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...ticket } : t
          ),
        })),

      updateSparePartStock: (id, quantity, type) =>
        set((state) => ({
          spareParts: state.spareParts.map((sp) =>
            sp.id === id
              ? {
                  ...sp,
                  stock: type === "in" ? sp.stock + quantity : sp.stock - quantity,
                }
              : sp
          ),
        })),

      addCostRecord: (record) =>
        set((state) => ({
          costRecords: [
            { ...record, id: generateId("cost") },
            ...state.costRecords,
          ],
        })),

      setDeviceStatus: (id, status) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, status } : d
          ),
        })),
    }),
    {
      name: "uav-fleet-storage",
    }
  )
);
