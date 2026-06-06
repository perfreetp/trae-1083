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
  RepairLogEntry,
  MaintenanceStatus,
  Budget,
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
  repairLogEntries: RepairLogEntry[];
  budgets: Budget[];
  
  addDevice: (device: Omit<Device, "id">) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  addFlightRecord: (record: Omit<FlightRecord, "id">) => void;
  addMaintenanceTask: (task: Omit<MaintenanceTask, "id">) => void;
  updateMaintenanceTask: (id: string, task: Partial<MaintenanceTask>) => void;
  refreshOverdueTasks: () => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  updateSparePartStock: (id: string, quantity: number, type: "in" | "out", operator: string, notes?: string, deviceId?: string, ticketId?: string, maintenanceTaskId?: string) => boolean;
  addCostRecord: (record: Omit<CostRecord, "id">) => void;
  setDeviceStatus: (id: string, status: Device["status"]) => void;
  addInventoryTransaction: (tx: Omit<InventoryTransaction, "id">) => void;
  addStockTake: (stockTake: Omit<StockTake, "id">) => void;
  updateStockTake: (id: string, stockTake: Partial<StockTake>) => void;
  addSparePart: (part: Omit<SparePart, "id">) => void;
  checkAndGenerateCycleMaintenance: () => void;
  addRepairLogEntry: (entry: Omit<RepairLogEntry, "id">) => void;
  addBudget: (budget: Omit<Budget, "id" | "createdAt">) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
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
      repairLogEntries: [],
      budgets: [],

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
        set((state) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const isOverdue = dueDate < today && task.status !== "completed" && task.status !== "in_progress";
          const status: MaintenanceStatus = isOverdue ? "overdue" : task.status;
          
          return {
            maintenanceTasks: [
              { ...task, id: generateId("maint"), status },
              ...state.maintenanceTasks,
            ],
          };
        }),

      refreshOverdueTasks: () =>
        set((state) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const updatedTasks = state.maintenanceTasks.map((t) => {
            if (t.status === "completed" || t.status === "in_progress") return t;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const isOverdue = dueDate < today;
            const status: MaintenanceStatus = isOverdue ? "overdue" : "pending";
            return {
              ...t,
              status,
            };
          });
          return { maintenanceTasks: updatedTasks };
        }),

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
        set((state) => {
          let newDevices = state.devices;
          if (ticket.isGround) {
            newDevices = state.devices.map((d) =>
              d.id === ticket.deviceId ? { ...d, status: "grounded" } : d
            );
          }
          return {
            tickets: [{ ...ticket, id: generateId("tk") }, ...state.tickets],
            devices: newDevices,
          };
        }),

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

      updateSparePartStock: (id, quantity, type, operator, notes?, deviceId?, ticketId?, maintenanceTaskId?) => {
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
            deviceId,
            ticketId,
            maintenanceTaskId,
          };

          let newCostRecords = state.costRecords;
          if (type === "out") {
            const maintenanceTask = maintenanceTaskId
              ? state.maintenanceTasks.find((t) => t.id === maintenanceTaskId)
              : null;
            newCostRecords = [
              {
                id: generateId("cost"),
                category: "spare_parts",
                amount: part.unitPrice * quantity,
                date: new Date().toISOString().split("T")[0],
                description: `备件领用: ${part.name} x${quantity}`,
                deviceId: deviceId || "",
                ticketId,
                taskId: maintenanceTaskId,
                taskType: maintenanceTask ? "maintenance" : ticketId ? "repair" : undefined,
                taskName: maintenanceTask?.type,
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

      checkAndGenerateCycleMaintenance: () =>
        set((state) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          let newTasks = [...state.maintenanceTasks];
          let updatedDevices = [...state.devices];

          state.devices.forEach((device) => {
            if (!device.maintenanceCycleRules) return;

            device.maintenanceCycleRules.forEach((rule, ruleIdx) => {
              let shouldGenerate = false;
              let dueDate = "";
              let description = "";

              if (rule.type === "flight_hours") {
                const lastHours = rule.lastFlightHours || 0;
                const currentHours = device.totalFlightHours;
                if (currentHours - lastHours >= rule.interval) {
                  shouldGenerate = true;
                  dueDate = new Date().toISOString().split("T")[0];
                  description = `按飞行小时周期保养: 累计 ${currentHours.toFixed(0)} 小时，距上次保养已飞行 ${(currentHours - lastHours).toFixed(0)} 小时`;
                }
              } else if (rule.type === "date") {
                const lastDate = rule.lastTriggeredAt
                  ? new Date(rule.lastTriggeredAt)
                  : new Date(device.purchaseDate);
                const nextDate = new Date(lastDate);
                nextDate.setDate(nextDate.getDate() + rule.interval);
                nextDate.setHours(0, 0, 0, 0);

                if (today >= nextDate) {
                  const hasPendingTask = state.maintenanceTasks.some(
                    (t) =>
                      t.deviceId === device.id &&
                      t.type.includes("周期保养") &&
                      (t.status === "pending" ||
                        t.status === "in_progress" ||
                        t.status === "overdue")
                  );
                  if (!hasPendingTask) {
                    shouldGenerate = true;
                    dueDate = nextDate.toISOString().split("T")[0];
                    description = `按日期周期保养: 每 ${rule.interval} 天一次`;
                  }
                }
              }

              if (shouldGenerate) {
                const todayCheck = new Date();
                todayCheck.setHours(0, 0, 0, 0);
                const dueDateCheck = new Date(dueDate);
                dueDateCheck.setHours(0, 0, 0, 0);
                const taskStatus: MaintenanceStatus = dueDateCheck < todayCheck ? "overdue" : "pending";
                
                const newTask = {
                  id: generateId("maint"),
                  deviceId: device.id,
                  type: "周期保养",
                  description,
                  dueDate,
                  status: taskStatus,
                  isAutoGenerated: true,
                  cycleRule: rule,
                };

                newTasks = [newTask, ...newTasks];

                updatedDevices = updatedDevices.map((d) => {
                  if (d.id === device.id && d.maintenanceCycleRules) {
                    const newRules = [...d.maintenanceCycleRules];
                    newRules[ruleIdx] = {
                      ...newRules[ruleIdx],
                      lastTriggeredAt: new Date().toISOString().split("T")[0],
                      lastFlightHours:
                        rule.type === "flight_hours"
                          ? device.totalFlightHours
                          : undefined,
                    };
                    return { ...d, maintenanceCycleRules: newRules };
                  }
                  return d;
                });
              }
            });
          });

          return {
            maintenanceTasks: newTasks,
            devices: updatedDevices,
          };
        }),

      addRepairLogEntry: (entry) =>
        set((state) => ({
          repairLogEntries: [
            { ...entry, id: generateId("rlog") },
            ...state.repairLogEntries,
          ],
        })),

      addBudget: (budget) =>
        set((state) => ({
          budgets: [
            { ...budget, id: generateId("bg"), createdAt: new Date().toISOString().split("T")[0] },
            ...state.budgets,
          ],
        })),

      updateBudget: (id, budget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        })),

      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
    }),
    {
      name: "uav-fleet-storage",
    }
  )
);
