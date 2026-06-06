import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  FileText,
  Download,
  Filter,
  Layers,
  Cpu,
  Target,
  ListTodo,
  Plane,
  Plus,
  Settings,
  TrendingDown,
  AlertTriangle,
  X,
  Link2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useStore } from "@/store/useStore";
import { exportToCSV } from "@/utils/csv";

const COST_COLORS = {
  maintenance: "#3b82f6",
  spare_parts: "#10b981",
  external_repair: "#f97316",
  insurance: "#8b5cf6",
  other: "#6b7280",
};

const COST_LABELS: Record<string, string> = {
  maintenance: "维保费用",
  spare_parts: "备件费用",
  external_repair: "外修费用",
  insurance: "保险费用",
  other: "其他费用",
};

export default function Reports() {
  const costRecords = useStore((state) => state.costRecords);
  const devices = useStore((state) => state.devices);
  const tickets = useStore((state) => state.tickets);
  const maintenanceTasks = useStore((state) => state.maintenanceTasks);
  const flightRecords = useStore((state) => state.flightRecords);
  const depreciations = useStore((state) => state.depreciations);
  const budgets = useStore((state) => state.budgets);
  const addBudget = useStore((state) => state.addBudget);
  const deleteBudget = useStore((state) => state.deleteBudget);
  const [timeRange, setTimeRange] = useState("year");
  const [viewMode, setViewMode] = useState<"device" | "category" | "task" | "budget">("device");
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetFilterCategory, setBudgetFilterCategory] = useState<"all" | "maintenance" | "spare_parts" | "external_repair" | "insurance">("all");
  const [budgetForm, setBudgetForm] = useState({
    type: "monthly" as "monthly" | "device",
    period: new Date().toISOString().slice(0, 7),
    deviceId: "",
    category: "all" as "maintenance" | "spare_parts" | "external_repair" | "insurance" | "other" | "all",
    amount: 0,
  });
  const [editingOverspend, setEditingOverspend] = useState<{ id: string; reason: string } | null>(null);
  const [isAddCostModalOpen, setIsAddCostModalOpen] = useState(false);
  const [costForm, setCostForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "maintenance" as "maintenance" | "spare_parts" | "external_repair" | "insurance" | "other",
    amount: 0,
    description: "",
    operator: "",
    linkType: "none" as "none" | "device" | "ticket" | "maintenance" | "flight",
    linkedDeviceId: "",
    linkedTicketId: "",
    linkedMaintenanceId: "",
    linkedFlightId: "",
  });
  const addCostRecord = useStore((state) => state.addCostRecord);

  const totalCost = costRecords.reduce((sum, c) => sum + c.amount, 0);
  const avgMonthlyCost = Math.round(totalCost / 6);

  const handleAddBudget = () => {
    if (budgetForm.amount <= 0) {
      alert("请输入预算金额");
      return;
    }
    addBudget({
      type: budgetForm.type,
      period: budgetForm.type === "monthly" ? budgetForm.period : undefined,
      deviceId: budgetForm.type === "device" ? budgetForm.deviceId : undefined,
      category: budgetForm.category,
      amount: budgetForm.amount,
    });
    setIsBudgetModalOpen(false);
    setBudgetForm({
      type: "monthly",
      period: new Date().toISOString().slice(0, 7),
      deviceId: "",
      category: "all",
      amount: 0,
    });
  };

  const getBudgetComparison = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const filteredBudgets = budgets.filter((b) => 
      budgetFilterCategory === "all" || b.category === budgetFilterCategory || b.category === "all"
    );
    
    return filteredBudgets.map((budget) => {
      let actual = 0;
      if (budget.type === "monthly") {
        const monthRecords = costRecords.filter((c) => {
          const recordMonth = c.date.slice(0, 7);
          const matchesMonth = budget.period ? recordMonth === budget.period : recordMonth === currentMonth;
          const matchesCategory = budget.category === "all" || c.category === budget.category;
          return matchesMonth && matchesCategory;
        });
        actual = monthRecords.reduce((sum, c) => sum + c.amount, 0);
      } else if (budget.type === "device" && budget.deviceId) {
        const deviceRecords = costRecords.filter((c) => {
          const matchesDevice = c.deviceId === budget.deviceId;
          const matchesCategory = budget.category === "all" || c.category === budget.category;
          return matchesDevice && matchesCategory;
        });
        actual = deviceRecords.reduce((sum, c) => sum + c.amount, 0);
      }
      
      const difference = actual - budget.amount;
      const percentage = budget.amount > 0 ? Math.round((actual / budget.amount) * 100) : 0;
      const device = budget.deviceId ? devices.find((d) => d.id === budget.deviceId) : null;
      
      return {
        id: budget.id,
        type: budget.type,
        period: budget.period || currentMonth,
        deviceName: device?.name || "",
        category: budget.category,
        budget: budget.amount,
        actual,
        difference,
        percentage,
        isOver: actual > budget.amount,
        overspendReason: budget.overspendReason,
      };
    });
  };

  const budgetComparison = getBudgetComparison();

  const handleAddCostSubmit = () => {
    if (!costForm.amount || costForm.amount <= 0) {
      alert("请输入有效金额");
      return;
    }
    if (!costForm.operator) {
      alert("请填写经办人");
      return;
    }
    if (costForm.linkType === "device" && !costForm.linkedDeviceId) {
      alert("请选择关联设备");
      return;
    }
    if (costForm.linkType === "ticket" && !costForm.linkedTicketId) {
      alert("请选择关联故障工单");
      return;
    }
    if (costForm.linkType === "maintenance" && !costForm.linkedMaintenanceId) {
      alert("请选择关联维保任务");
      return;
    }
    if (costForm.linkType === "flight" && !costForm.linkedFlightId) {
      alert("请选择关联飞行记录");
      return;
    }

    let deviceId: string | undefined = costForm.linkedDeviceId;
    let ticketId: string | undefined;
    let taskId: string | undefined;
    let taskType: "maintenance" | "repair" | "flight" | undefined;
    let taskName: string | undefined;

    if (costForm.linkType === "ticket") {
      const ticket = tickets.find((t) => t.id === costForm.linkedTicketId);
      ticketId = costForm.linkedTicketId;
      deviceId = ticket?.deviceId;
      taskId = ticketId;
      taskType = "repair";
      taskName = ticket?.title;
    } else if (costForm.linkType === "maintenance") {
      const task = maintenanceTasks.find((t) => t.id === costForm.linkedMaintenanceId);
      taskId = costForm.linkedMaintenanceId;
      taskType = "maintenance";
      deviceId = task?.deviceId;
      taskName = task?.type;
    } else if (costForm.linkType === "flight") {
      const flight = flightRecords.find((f) => f.id === costForm.linkedFlightId);
      taskId = costForm.linkedFlightId;
      taskType = "flight";
      deviceId = flight?.deviceId;
      taskName = flight ? `${flight.missionType} - ${flight.location}` : undefined;
    }

    addCostRecord({
      date: costForm.date,
      category: costForm.category,
      amount: costForm.amount,
      description: costForm.description,
      operator: costForm.operator,
      deviceId,
      ticketId,
      taskId,
      taskType,
      taskName,
    });

    setIsAddCostModalOpen(false);
    setCostForm({
      date: new Date().toISOString().split("T")[0],
      category: "maintenance",
      amount: 0,
      description: "",
      operator: "",
      linkType: "none",
      linkedDeviceId: "",
      linkedTicketId: "",
      linkedMaintenanceId: "",
      linkedFlightId: "",
    });
  };

  const handleExportCostRecords = () => {
    const headers = [
      { key: "date", label: "日期" },
      { key: "category", label: "费用分类" },
      { key: "amount", label: "金额" },
      { key: "deviceName", label: "关联设备" },
      { key: "taskName", label: "关联工单/任务" },
      { key: "taskTypeLabel", label: "关联类型" },
      { key: "description", label: "说明" },
      { key: "operator", label: "经办人" },
    ];
    const exportData = costRecords.map((record) => {
      const device = devices.find((d) => d.id === record.deviceId);
      let taskName = "";
      let taskTypeLabel = "无";
      
      if (record.ticketId) {
        const ticket = tickets.find((t) => t.id === record.ticketId);
        if (ticket) {
          taskName = ticket.title;
          taskTypeLabel = "故障工单";
        }
      } else if (record.taskId && record.taskType === "maintenance") {
        const task = maintenanceTasks.find((t) => t.id === record.taskId);
        if (task) {
          taskName = task.type;
          taskTypeLabel = "维保任务";
        }
      } else if (record.taskId && record.taskType === "repair") {
        const ticket = tickets.find((t) => t.id === record.taskId);
        if (ticket) {
          taskName = ticket.title;
          taskTypeLabel = "故障工单";
        }
      } else if (record.taskId && record.taskType === "flight") {
        const flight = flightRecords.find((f) => f.id === record.taskId);
        if (flight) {
          taskName = flight.missionType + " - " + flight.location;
          taskTypeLabel = "飞行任务";
        }
      }
      
      return {
        ...record,
        category: COST_LABELS[record.category] || record.category,
        deviceName: device?.name || "-",
        taskName: taskName || record.taskName || "-",
        taskTypeLabel,
      };
    });
    exportToCSV(exportData, "成本明细", headers);
  };

  const costByCategory = Object.entries(
    costRecords.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, value]) => ({
    name: COST_LABELS[category] || category,
    value,
    color: COST_COLORS[category as keyof typeof COST_COLORS] || "#6b7280",
  }));

  const costByDevice = devices.map((device) => {
    const deviceCosts = costRecords.filter((c) => c.deviceId === device.id);
    const total = deviceCosts.reduce((sum, c) => sum + c.amount, 0);
    const byCategory = deviceCosts.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      id: device.id,
      name: device.name,
      assetNumber: device.assetNumber,
      total,
      maintenance: byCategory.maintenance || 0,
      spare_parts: byCategory.spare_parts || 0,
      external_repair: byCategory.external_repair || 0,
      insurance: byCategory.insurance || 0,
      other: byCategory.other || 0,
    };
  }).filter((d) => d.total > 0);

  const monthlyCostData = [
    { month: "1月", cost: 11400 },
    { month: "2月", cost: 8700 },
    { month: "3月", cost: 5700 },
    { month: "4月", cost: 7000 },
    { month: "5月", cost: 11500 },
    { month: "6月", cost: 3500 },
  ];

  const deviceDepreciationData = depreciations.map((dep) => {
    const device = devices.find((d) => d.id === dep.deviceId);
    return {
      name: device?.assetNumber || "未知",
      原值: device?.purchasePrice || 0,
      净值: dep.currentValue,
      累计折旧: dep.accumulatedDepreciation,
      deviceId: dep.deviceId,
      depreciationRate: dep.depreciationRate,
      calculatedDate: dep.calculatedDate,
    };
  });

  const deviceCostChartData = costByDevice.map((d) => ({
    name: d.assetNumber,
    维保: d.maintenance,
    备件: d.spare_parts,
    外修: d.external_repair,
    保险: d.insurance,
    其他: d.other,
  }));

  const costByTask: Record<string, any> = {};

  flightRecords.forEach((flight) => {
    const device = devices.find((d) => d.id === flight.deviceId);
    const taskName = flight.missionType + " - " + flight.location;
    const key = "flight_" + flight.id;
    costByTask[key] = {
      taskName,
      taskType: "flight",
      relatedDevice: device?.name || "未知设备",
      flightDate: flight.date,
      pilot: flight.pilot,
      flightDuration: flight.duration,
      total: 0,
      maintenance: 0,
      spare_parts: 0,
      external_repair: 0,
      insurance: 0,
      other: 0,
    };
  });

  costRecords.forEach((record) => {
    let taskName = "未关联任务";
    let taskType = "other";
    let relatedDevice = "-";
    let key = "unlinked";

    if (record.ticketId) {
      const ticket = tickets.find((t) => t.id === record.ticketId);
      if (ticket) {
        taskName = ticket.title;
        taskType = "repair";
        const device = devices.find((d) => d.id === ticket.deviceId);
        relatedDevice = device?.name || "未知设备";
        key = "ticket_" + ticket.id;
      }
    } else if (record.taskId && record.taskType === "maintenance") {
      const task = maintenanceTasks.find((t) => t.id === record.taskId);
      if (task) {
        taskName = task.type;
        taskType = "maintenance";
        const device = devices.find((d) => d.id === task.deviceId);
        relatedDevice = device?.name || "未知设备";
        key = "maintenance_" + task.id;
      }
    } else if (record.taskId && record.taskType === "flight") {
      key = "flight_" + record.taskId;
      const flight = flightRecords.find((f) => f.id === record.taskId);
      if (flight) {
        const device = devices.find((d) => d.id === flight.deviceId);
        taskName = flight.missionType + " - " + flight.location;
        relatedDevice = device?.name || "未知设备";
      }
    } else if (record.taskId && record.taskType === "repair") {
      const ticket = tickets.find((t) => t.id === record.taskId);
      if (ticket) {
        taskName = ticket.title;
        taskType = "repair";
        const device = devices.find((d) => d.id === ticket.deviceId);
        relatedDevice = device?.name || "未知设备";
        key = "ticket_" + ticket.id;
      }
    }

    if (!costByTask[key]) {
      costByTask[key] = {
        taskName,
        taskType,
        relatedDevice,
        total: 0,
        maintenance: 0,
        spare_parts: 0,
        external_repair: 0,
        insurance: 0,
        other: 0,
      };
    }
    costByTask[key].total += record.amount;
    (costByTask[key] as any)[record.category] =
      ((costByTask[key] as any)[record.category] || 0) + record.amount;
  });

  const costByTaskList = Object.values(costByTask).sort(
    (a, b) => b.total - a.total
  );

  const taskTypeLabels: Record<string, string> = {
    flight: "飞行任务",
    maintenance: "维保任务",
    repair: "故障维修",
    other: "其他",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("device")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "device"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Cpu className="w-4 h-4" />
              按设备
            </button>
            <button
              onClick={() => setViewMode("task")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "task"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              按任务
            </button>
            <button
              onClick={() => setViewMode("category")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "category"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Layers className="w-4 h-4" />
              按分类
            </button>
            <button
              onClick={() => setViewMode("budget")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "budget"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Target className="w-4 h-4" />
              预算对比
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            设置预算
          </button>
          <button
            onClick={handleExportCostRecords}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            导出报表
          </button>
          <button
            onClick={() => setIsAddCostModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            新增费用
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{totalCost.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">总费用</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{avgMonthlyCost.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">月均费用</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{costRecords.length}</p>
              <p className="text-sm text-gray-500">费用记录</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{depreciations.reduce((sum, d) => sum + d.accumulatedDepreciation, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">累计折旧</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度成本趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`¥${value}`, "费用"]} />
                <Bar dataKey="cost" name="成本" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">成本构成分析</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={costByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {costByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`¥${value}`, "金额"]} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {costByCategory.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">成本分摊分析</h3>
        </div>
        {viewMode === "device" ? (
          <>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceCostChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`¥${value}`, ""]} />
                  <Legend />
                  <Bar dataKey="维保" name="维保费用" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="备件" name="备件费用" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="外修" name="外修费用" fill="#f97316" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="保险" name="保险费用" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="其他" name="其他费用" fill="#6b7280" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      设备编号
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      设备名称
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      维保费用
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      备件费用
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      外修费用
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      保险费用
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      总计
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costByDevice.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                        {item.assetNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        ¥{item.maintenance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        ¥{item.spare_parts.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        ¥{item.external_repair.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        ¥{item.insurance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                        ¥{item.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {totalCost > 0
                          ? ((item.total / totalCost) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : viewMode === "task" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                    任务名称
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                    任务类型
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                    关联设备
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    维保费用
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    备件费用
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    外修费用
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    保险费用
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    总计
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    占比
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costByTaskList.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-800 font-medium">{item.taskName}</div>
                      {item.taskType === "flight" && item.flightDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.flightDate} · {item.pilot || "未知飞手"} · 飞行 {item.flightDuration || 0}h
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          item.taskType === "repair"
                            ? "bg-red-100 text-red-700"
                            : item.taskType === "maintenance"
                            ? "bg-blue-100 text-blue-700"
                            : item.taskType === "flight"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {taskTypeLabels[item.taskType] || "其他"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.relatedDevice}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      ¥{item.maintenance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      ¥{item.spare_parts.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      ¥{item.external_repair.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      ¥{item.insurance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                      ¥{item.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {totalCost > 0
                        ? ((item.total / totalCost) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
                {costByTaskList.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      暂无任务相关的费用数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : viewMode === "budget" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="text-sm text-gray-600 flex items-center">分类筛选：</span>
              {(["all", "maintenance", "spare_parts", "external_repair", "insurance"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBudgetFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    budgetFilterCategory === cat
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "全部" : COST_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">预算内项目</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {budgetComparison.filter((b) => !b.isOver).length}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">超支项目</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {budgetComparison.filter((b) => b.isOver).length}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">累计超支</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  ¥{Math.max(0, budgetComparison.reduce((sum, b) => sum + Math.max(0, b.difference), 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      周期/设备
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      费用类别
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      预算金额
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      实际支出
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      差额
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                      执行率
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      超支原因
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">
                      状态
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budgetComparison.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div>{item.type === "device" ? item.deviceName : item.period}</div>
                        <div className="text-xs text-gray-400">
                          {item.type === "device" ? "设备预算" : "月度预算"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {COST_LABELS[item.category] || "全部"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        ¥{item.budget.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                        ¥{item.actual.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold ${
                        item.isOver ? "text-red-600" : "text-green-600"
                      }`}>
                        {item.isOver ? "+" : ""}¥{item.difference.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.percentage > 100 ? "bg-red-500" : item.percentage > 80 ? "bg-orange-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>
                          <span>{item.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.isOver ? (
                          editingOverspend?.id === item.id ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={editingOverspend.reason}
                                onChange={(e) =>
                                  setEditingOverspend({ ...editingOverspend, reason: e.target.value })
                                }
                                className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                                placeholder="填写超支原因"
                              />
                              <button
                                onClick={() => {
                                  useStore.getState().updateBudget(item.id, {
                                    overspendReason: editingOverspend.reason,
                                  });
                                  setEditingOverspend(null);
                                }}
                                className="px-2 py-1 bg-primary-500 text-white rounded text-xs"
                              >
                                保存
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setEditingOverspend({
                                  id: item.id,
                                  reason: item.overspendReason || "",
                                })
                              }
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              {item.overspendReason || "点击填写原因"}
                            </button>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.isOver
                            ? "bg-red-100 text-red-700"
                            : item.percentage > 80
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {item.isOver ? "超支" : item.percentage > 80 ? "预警" : "正常"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteBudget(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {budgetComparison.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        暂无预算数据，点击右上角"设置预算"添加
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                    费用分类
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    金额
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">
                    占比
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                    记录数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costByCategory.map((item) => {
                  const count = costRecords.filter(
                    (c) => COST_LABELS[c.category] === item.name
                  ).length;
                  return (
                    <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                        ¥{item.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {totalCost > 0
                          ? ((item.value / totalCost) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {count} 条
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">资产折旧明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  设备编号
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  设备名称
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  原值
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  累计折旧
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  净值
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  折旧率
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  计算日期
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deviceDepreciationData.map((item, index) => {
                const dep = depreciations[index];
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {devices.find((d) => d.id === dep?.deviceId)?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      ¥{item.原值.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-orange-600 font-medium">
                      ¥{item.累计折旧.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600 font-medium">
                      ¥{item.净值.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.depreciationRate || 0}%/年
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.calculatedDate || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">最近费用记录</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {costRecords.slice(0, 10).map((record) => (
            <div
              key={record.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor:
                      COST_COLORS[record.category as keyof typeof COST_COLORS] +
                      "20",
                    color: COST_COLORS[record.category as keyof typeof COST_COLORS],
                  }}
                >
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{record.description}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {COST_LABELS[record.category] || record.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date}
                    </span>
                    {record.deviceId && (
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {devices.find((d) => d.id === record.deviceId)?.name || "未知设备"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800">
                ¥{record.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">设置预算</h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  预算类型
                </label>
                <select
                  value={budgetForm.type}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, type: e.target.value as "monthly" | "device" })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="monthly">月度预算</option>
                  <option value="device">设备预算</option>
                </select>
              </div>
              {budgetForm.type === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    月份
                  </label>
                  <input
                    type="month"
                    value={budgetForm.period}
                    onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              {budgetForm.type === "device" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    选择设备
                  </label>
                  <select
                    value={budgetForm.deviceId}
                    onChange={(e) => setBudgetForm({ ...budgetForm, deviceId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择设备</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.assetNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  费用类别
                </label>
                <select
                  value={budgetForm.category}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, category: e.target.value as any })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">全部类别</option>
                  <option value="maintenance">维保费用</option>
                  <option value="spare_parts">备件费用</option>
                  <option value="external_repair">外修费用</option>
                  <option value="insurance">保险费用</option>
                  <option value="other">其他费用</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  预算金额 (元)
                </label>
                <input
                  type="number"
                  value={budgetForm.amount || ""}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: Number(e.target.value) })}
                  placeholder="请输入预算金额"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddBudget}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddCostModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">费用补录/关联</h3>
              <button
                onClick={() => setIsAddCostModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={costForm.date}
                    onChange={(e) => setCostForm({ ...costForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    费用分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={costForm.category}
                    onChange={(e) => setCostForm({ ...costForm, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="maintenance">维保费用</option>
                    <option value="spare_parts">备件费用</option>
                    <option value="external_repair">外修费用</option>
                    <option value="insurance">保险费用</option>
                    <option value="other">其他费用</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    金额 (元) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={costForm.amount || ""}
                    onChange={(e) => setCostForm({ ...costForm, amount: Number(e.target.value) })}
                    placeholder="请输入金额"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    经办人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={costForm.operator}
                    onChange={(e) => setCostForm({ ...costForm, operator: e.target.value })}
                    placeholder="请输入经办人"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  费用说明
                </label>
                <textarea
                  value={costForm.description}
                  onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                  placeholder="请输入费用说明（可选）"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">关联对象（可选）</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">关联类型</label>
                  <select
                    value={costForm.linkType}
                    onChange={(e) => setCostForm({ ...costForm, linkType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="none">不关联</option>
                    <option value="device">关联设备</option>
                    <option value="ticket">关联故障工单</option>
                    <option value="maintenance">关联维保任务</option>
                    <option value="flight">关联飞行记录</option>
                  </select>
                </div>
                {costForm.linkType === "device" && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">选择设备</label>
                    <select
                      value={costForm.linkedDeviceId}
                      onChange={(e) => setCostForm({ ...costForm, linkedDeviceId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择设备</option>
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.assetNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {costForm.linkType === "ticket" && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">选择故障工单</label>
                    <select
                      value={costForm.linkedTicketId}
                      onChange={(e) => setCostForm({ ...costForm, linkedTicketId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择工单</option>
                      {tickets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {costForm.linkType === "maintenance" && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">选择维保任务</label>
                    <select
                      value={costForm.linkedMaintenanceId}
                      onChange={(e) => setCostForm({ ...costForm, linkedMaintenanceId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择维保任务</option>
                      {maintenanceTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type} - {devices.find((d) => d.id === t.deviceId)?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {costForm.linkType === "flight" && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">选择飞行记录</label>
                    <select
                      value={costForm.linkedFlightId}
                      onChange={(e) => setCostForm({ ...costForm, linkedFlightId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择飞行记录</option>
                      {flightRecords.slice(0, 50).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.date} - {f.missionType} - {f.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsAddCostModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddCostSubmit}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                保存费用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
