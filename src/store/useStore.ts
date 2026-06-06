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
  InventoryTransaction,
  StockTake,
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
  inventoryTransactions: InventoryTransaction[];
  stockTakes: StockTake[];
  
  addDevice: (device: Omit<Device, "id">) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  addFlightRecord: (record: Omit<FlightRecord, "id">) => void;
  addMaintenanceTask: (task: Omit<MaintenanceTask, "id">) => void;
  updateMaintenanceTask: (id: string, task: Partial<MaintenanceTask>) => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  updateSparePartStock: (id: string, quantity: number, type: "in" | "out", operator: string, notes?: string) => boolean;
  addCostRecord: (record: Omit<CostRecord, "id">) => void;
  setDeviceStatus: (id: string, status: Device["status"]) => void;
  addInventoryTransaction: (tx: Omit<InventoryTransaction, "id">) => void;
  addStockTake: (stockTake: Omit<StockTake, "id">) => void;
  updateStockTake: (id: string, stockTake: Partial<StockTake>) => void;
  addSparePart: (part: Omit<SparePart, "id">) => void;
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
      inventoryTransactions: [],
      stockTakes: [],

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
        set((state) => {
          const updatedTasks = state.maintenanceTasks.map((t) =>
            t.id === id ? { ...t, ...task } : t
          );
          const updatedTask = updatedTasks.find((t) => t.id === id);
          let newCostRecords = state.costRecords;
          if (
            updatedTask &&
            task.status === "completed" &&
            task.cost &&
            task.cost > 0
          ) {
            newCostRecords = [
              {
                id: generateId("cost"),
                category: "maintenance",
                amount: task.cost,
                date: task.completedDate || new Date().toISOString().split("T")[0],
                description: `维保完成: ${updatedTask.type}`,
                deviceId: updatedTask.deviceId,
              },
              ...state.costRecords,
            ];
          }
          return {
            maintenanceTasks: updatedTasks,
            costRecords: newCostRecords,
          };
        }),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [{ ...ticket, id: generateId("tk") }, ...state.tickets],
        })),

      updateTicket: (id, ticket) =>
        set((state) => {
          const updatedTickets = state.tickets.map((t) =>
            t.id === id ? { ...t, ...ticket } : t
          );
          const updatedTicket = updatedTickets.find((t) => t.id === id);
          let newCostRecords = state.costRecords;
          let newDevices = state.devices;

          if (updatedTicket) {
            if (
              ticket.status === "resolved" &&
              updatedTicket.externalRepair?.cost
            ) {
              newCostRecords = [
                {
                  id: generateId("cost"),
                  category: "external_repair",
                  amount: updatedTicket.externalRepair.cost,
                  date: new Date().toISOString().split("T")[0],
                  description: `外修费用: ${updatedTicket.title}`,
                  deviceId: updatedTicket.deviceId,
                  ticketId: updatedTicket.id,
                },
                ...newCostRecords,
              ];
            }
            if (ticket.isGround === true) {
              newDevices = state.devices.map((d) =>
                d.id === updatedTicket.deviceId
                  ? { ...d, status: "grounded" }
                  : d
              );
            } else if (
              ticket.status === "resolved" ||
              ticket.status === "closed"
            ) {
              const hasOpenGroundTicket = state.tickets.some(
                (t) =>
                  t.id !== id &&
                  t.deviceId === updatedTicket.deviceId &&
                  t.isGround &&
                  t.status !== "resolved" &&
                  t.status !== "closed"
              );
              if (!hasOpenGroundTicket && ticket.isGround === false) {
                newDevices = state.devices.map((d) =>
                  d.id === updatedTicket.deviceId
                    ? { ...d, status: "active" }
                    : d
                );
              }
            }
          }

          return {
            tickets: updatedTickets,
            costRecords: newCostRecords,
            devices: newDevices,
          };
        }),

      updateSparePartStock: (id, quantity, type, operator, notes?) => {
        let success = false;
        set((state) => {
          const part = state.spareParts.find((p) => p.id === id);
          if (!part) {
            success = false;
            return state;
          }
          if (type === "out" && part.stock < quantity) {
            success = false;
            return state;
          }

          const newStock =
            type === "in" ? part.stock + quantity : part.stock - quantity;

          const transaction: InventoryTransaction = {
            id: generateId("tx"),
            sparePartId: id,
            type,
            quantity,
            date: new Date().toISOString().split("T")[0],
            operator,
            notes,
          };

          let newCostRecords = state.costRecords;
          if (type === "out") {
            newCostRecords = [
              {
                id: generateId("cost"),
                category: "spare_parts",
                amount: part.unitPrice * quantity,
                date: new Date().toISOString().split("T")[0],
                description: `备件领用: ${part.name} x${quantity}`,
                deviceId: "",
              },
              ...state.costRecords,
            ];
          }

          success = true;
          return {
            spareParts: state.spareParts.map((sp) =>
              sp.id === id ? { ...sp, stock: newStock } : sp
            ),
            inventoryTransactions: [transaction, ...state.inventoryTransactions],
            costRecords: newCostRecords,
          };
        });
        return success;
      },

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

      addInventoryTransaction: (tx) =>
        set((state) => ({
          inventoryTransactions: [
            { ...tx, id: generateId("tx") },
            ...state.inventoryTransactions,
          ],
        })),

      addStockTake: (stockTake) =>
        set((state) => ({
          stockTakes: [
            { ...stockTake, id: generateId("st") },
            ...state.stockTakes,
          ],
        })),

      updateStockTake: (id, stockTake) =>
        set((state) => ({
          stockTakes: state.stockTakes.map((st) =>
            st.id === id ? { ...st, ...stockTake } : st
          ),
        })),

      addSparePart: (part) =>
        set((state) => ({
          spareParts: [...state.spareParts, { ...part, id: generateId("sp") }],
        })),
    }),
    {
      name: "uav-fleet-storage",
    }
  )
);
