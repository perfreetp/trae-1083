export type DeviceType = "aircraft" | "battery" | "payload";
export type DeviceStatus = "active" | "maintenance" | "grounded" | "retired";
export type TicketStatus = "open" | "in_progress" | "pending_parts" | "external_repair" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "overdue";
export type InventoryLogType = "in" | "out" | "adjust";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  serialNumber: string;
  assetNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  status: DeviceStatus;
  responsiblePerson: string;
  totalFlightHours: number;
  insuranceExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  specifications?: Record<string, string>;
}

export interface Battery {
  id: string;
  deviceId: string;
  model: string;
  serialNumber: string;
  cycles: number;
  health: number;
  status: DeviceStatus;
  lastChargeDate: string;
  capacity: number;
  currentCapacity: number;
}

export interface FlightRecord {
  id: string;
  deviceId: string;
  date: string;
  pilot: string;
  duration: number;
  takeoffs: number;
  location: string;
  missionType: string;
  notes?: string;
  batteryIds?: string[];
}

export interface MaintenanceTask {
  id: string;
  deviceId: string;
  type: string;
  description: string;
  dueDate: string;
  status: MaintenanceStatus;
  completedDate?: string;
  assignee?: string;
  notes?: string;
  cost?: number;
}

export interface Ticket {
  id: string;
  deviceId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  reporter: string;
  createdAt: string;
  isGround: boolean;
  externalRepair?: {
    vendor: string;
    sentDate?: string;
    receivedDate?: string;
    cost?: number;
    trackingNumber?: string;
  };
}

export interface RepairLog {
  id: string;
  ticketId: string;
  action: string;
  date: string;
  technician: string;
  cost: number;
  notes?: string;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  safetyStock: number;
  unit: string;
  unitPrice: number;
  location?: string;
}

export interface SparePartUsage {
  id: string;
  ticketId: string;
  sparePartId: string;
  quantity: number;
  date: string;
  operator: string;
}

export interface InventoryLog {
  id: string;
  sparePartId: string;
  type: InventoryLogType;
  quantity: number;
  date: string;
  operator: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: "maintenance" | "insurance" | "battery" | "stock" | "overdue";
  title: string;
  message: string;
  severity: "info" | "warning" | "error";
  relatedId?: string;
  date: string;
}

export interface CostRecord {
  id: string;
  category: "maintenance" | "spare_parts" | "external_repair" | "insurance" | "other";
  amount: number;
  date: string;
  description: string;
  deviceId?: string;
  ticketId?: string;
}

export interface Depreciation {
  id: string;
  deviceId: string;
  currentValue: number;
  depreciationRate: number;
  calculatedDate: string;
  accumulatedDepreciation: number;
}

export type InventoryItemStatus = "normal" | "missing" | "damaged";

export interface StockTakeItem {
  deviceId: string;
  status: InventoryItemStatus;
  notes?: string;
}

export interface StockTake {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  status: "in_progress" | "completed";
  items: StockTakeItem[];
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  sparePartId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  operator: string;
  notes?: string;
  reference?: string;
}
