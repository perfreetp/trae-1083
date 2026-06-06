import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Cpu,
  Battery,
  Camera,
  Edit,
  Eye,
  QrCode,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  Wrench,
  AlertCircle,
  PlaneTakeoff,
  Package,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Download,
  Upload,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import ImportModal from "@/components/ImportModal";
import { useStore } from "@/store/useStore";
import { exportToCSV } from "@/utils/csv";
import type { DeviceType, Device, DeviceStatus } from "@/types";

const typeIcons: Record<DeviceType, typeof Cpu> = {
  aircraft: Cpu,
  battery: Battery,
  payload: Camera,
};

const typeLabels: Record<DeviceType, string> = {
  aircraft: "飞行器",
  battery: "电池",
  payload: "载荷",
};

const statusOptions: { value: DeviceStatus; label: string }[] = [
  { value: "active", label: "在役" },
  { value: "maintenance", label: "维保中" },
  { value: "grounded", label: "停飞" },
  { value: "retired", label: "已报废" },
];

const emptyDevice: Omit<Device, "id"> = {
  name: "",
  type: "aircraft",
  model: "",
  serialNumber: "",
  assetNumber: "",
  purchaseDate: "",
  purchasePrice: 0,
  status: "active",
  responsiblePerson: "",
  totalFlightHours: 0,
  insuranceExpiry: "",
  lastMaintenanceDate: "",
  nextMaintenanceDate: "",
};

export default function Devices() {
  const {
    devices,
    addDevice,
    updateDevice,
    stockTakes,
    flightRecords,
    maintenanceTasks,
    tickets,
    inventoryTransactions,
    spareParts,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DeviceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<Omit<Device, "id">>(emptyDevice);

  const handleExportDevices = () => {
    const headers = [
      { key: "name", label: "设备名称" },
      { key: "type", label: "设备类型" },
      { key: "model", label: "型号" },
      { key: "serialNumber", label: "序列号" },
      { key: "assetNumber", label: "资产编号" },
      { key: "purchaseDate", label: "采购日期" },
      { key: "purchasePrice", label: "采购价格" },
      { key: "status", label: "状态" },
      { key: "responsiblePerson", label: "责任人" },
      { key: "totalFlightHours", label: "累计飞行小时" },
      { key: "insuranceExpiry", label: "保险到期日" },
    ];
    const exportData = devices.map((d) => ({
      ...d,
      type: typeLabels[d.type],
      status: statusOptions.find((s) => s.value === d.status)?.label || d.status,
    }));
    exportToCSV(exportData, "设备档案", headers);
  };

  const handleImportDevices = (data: Record<string, any>[]) => {
    data.forEach((row) => {
      const typeKey = Object.keys(typeLabels).find(
        (k) => typeLabels[k as DeviceType] === row["设备类型"]
      ) as DeviceType;
      const statusKey = statusOptions.find((s) => s.label === row["状态"])?.value as DeviceStatus;
      
      addDevice({
        name: row["设备名称"] || row.name || "",
        type: typeKey || "aircraft",
        model: row["型号"] || row.model || "",
        serialNumber: row["序列号"] || row.serialNumber || "",
        assetNumber: row["资产编号"] || row.assetNumber || "",
        purchaseDate: row["采购日期"] || row.purchaseDate || "",
        purchasePrice: Number(row["采购价格"] || row.purchasePrice || 0),
        status: statusKey || "active",
        responsiblePerson: row["责任人"] || row.responsiblePerson || "",
        totalFlightHours: Number(row["累计飞行小时"] || row.totalFlightHours || 0),
        insuranceExpiry: row["保险到期日"] || row.insuranceExpiry || "",
        lastMaintenanceDate: row["上次维保日期"] || row.lastMaintenanceDate || "",
        nextMaintenanceDate: row["下次维保日期"] || row.nextMaintenanceDate || "",
      });
    });
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || device.type === filterType;
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getLatestStockTakeStatus = (deviceId: string) => {
    const completed = stockTakes.filter((st) => st.status === "completed");
    if (completed.length === 0) return null;
    const latest = completed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return latest.items.find((item) => item.deviceId === deviceId);
  };

  const handleAddSubmit = () => {
    if (!formData.name || !formData.model) {
      alert("请填写设备名称和型号");
      return;
    }
    addDevice(formData);
    setIsAddModalOpen(false);
    setFormData(emptyDevice);
  };

  const handleEditSubmit = () => {
    if (!selectedDevice || !formData.name || !formData.model) {
      alert("请填写设备名称和型号");
      return;
    }
    updateDevice(selectedDevice.id, formData);
    setIsEditModalOpen(false);
    setSelectedDevice(null);
  };

  const openViewModal = (device: Device) => {
    setSelectedDevice(device);
    setIsViewModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      model: device.model,
      serialNumber: device.serialNumber,
      assetNumber: device.assetNumber,
      purchaseDate: device.purchaseDate,
      purchasePrice: device.purchasePrice,
      status: device.status,
      responsiblePerson: device.responsiblePerson,
      totalFlightHours: device.totalFlightHours,
      insuranceExpiry: device.insuranceExpiry || "",
      lastMaintenanceDate: device.lastMaintenanceDate || "",
      nextMaintenanceDate: device.nextMaintenanceDate || "",
    });
    setIsEditModalOpen(true);
  };

  const DeviceForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            设备类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as DeviceType })
            }
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="aircraft">飞行器</option>
            <option value="battery">电池</option>
            <option value="payload">载荷</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            设备状态
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as DeviceStatus,
              })
            }
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            设备名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="如：大疆M300 RTK-01"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            型号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            placeholder="如：M300 RTK"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            序列号
          </label>
          <input
            type="text"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
            placeholder="设备出厂序列号"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            资产编号
          </label>
          <input
            type="text"
            value={formData.assetNumber}
            onChange={(e) =>
              setFormData({ ...formData, assetNumber: e.target.value })
            }
            placeholder="公司内部资产编号"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-500" />
          采购信息
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              采购日期
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              采购价格（元）
            </label>
            <input
              type="number"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchasePrice: Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          责任人
        </label>
        <input
          type="text"
          value={formData.responsiblePerson}
          onChange={(e) =>
            setFormData({ ...formData, responsiblePerson: e.target.value })
          }
          placeholder="负责该设备的人员姓名"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500" />
          日期与维保
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              保险到期日
            </label>
            <input
              type="date"
              value={formData.insuranceExpiry}
              onChange={(e) =>
                setFormData({ ...formData, insuranceExpiry: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              上次维保日期
            </label>
            <input
              type="date"
              value={formData.lastMaintenanceDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lastMaintenanceDate: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              下次维保日期
            </label>
            <input
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nextMaintenanceDate: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设备名称、编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as DeviceType | "all")
              }
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部类型</option>
              <option value="aircraft">飞行器</option>
              <option value="battery">电池</option>
              <option value="payload">载荷</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="active">在役</option>
              <option value="maintenance">维保中</option>
              <option value="grounded">停飞</option>
              <option value="retired">已报废</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportDevices}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            导出
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            导入
          </button>
          <button
            onClick={() => {
              setFormData(emptyDevice);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            新增设备
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["aircraft", "battery", "payload"] as DeviceType[]).map((type) => (
          <div
            key={type}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                {(() => {
                  const Icon = typeIcons[type];
                  return <Icon className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {devices.filter((d) => d.type === type).length}
                </p>
                <p className="text-sm text-gray-500">{typeLabels[type]}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {devices.filter((d) => d.status === "active").length}
              </p>
              <p className="text-sm text-gray-500">在役设备</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  设备信息
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  资产编号
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  类型
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  状态
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  责任人
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  飞行小时
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  最近盘点
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.map((device) => {
                const Icon = typeIcons[device.type];
                const stockTakeItem = getLatestStockTakeStatus(device.id);
                return (
                  <tr
                    key={device.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {device.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {device.model} · {device.serialNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-mono">
                          {device.assetNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {typeLabels[device.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {device.responsiblePerson.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">
                          {device.responsiblePerson}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {device.totalFlightHours.toFixed(1)} h
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {stockTakeItem ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            stockTakeItem.status === "normal"
                              ? "bg-green-100 text-green-700"
                              : stockTakeItem.status === "damaged"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {stockTakeItem.status === "normal"
                            ? "正常"
                            : stockTakeItem.status === "damaged"
                            ? "损坏"
                            : "缺失"}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">未盘点</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(device)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary-600"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(device)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary-600"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到匹配的设备</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="新增设备"
        size="lg"
      >
        <DeviceForm />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleAddSubmit}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            保存设备
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑设备"
        size="lg"
      >
        <DeviceForm />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleEditSubmit}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            保存修改
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="设备详情"
        size="lg"
      >
        {selectedDevice && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary-50 rounded-xl">
                {(() => {
                  const Icon = typeIcons[selectedDevice.type];
                  return <Icon className="w-10 h-10 text-primary-600" />;
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedDevice.name}
                  </h3>
                  <StatusBadge status={selectedDevice.status} />
                </div>
                <p className="text-gray-500 mt-1">
                  {selectedDevice.model} · {typeLabels[selectedDevice.type]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  基本信息
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">资产编号</span>
                    <span className="text-sm font-mono text-gray-800">
                      {selectedDevice.assetNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">序列号</span>
                    <span className="text-sm text-gray-800">
                      {selectedDevice.serialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">责任人</span>
                    <span className="text-sm text-gray-800 flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {selectedDevice.responsiblePerson.charAt(0)}
                      </div>
                      {selectedDevice.responsiblePerson}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">总飞行时长</span>
                    <span className="text-sm text-gray-800">
                      {selectedDevice.totalFlightHours.toFixed(1)} 小时
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  采购与维保
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">采购日期</span>
                    <span className="text-sm text-gray-800">
                      {selectedDevice.purchaseDate || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">采购价格</span>
                    <span className="text-sm text-gray-800">
                      ¥{selectedDevice.purchasePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">上次维保</span>
                    <span className="text-sm text-gray-800">
                      {selectedDevice.lastMaintenanceDate || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">下次维保</span>
                    <span className="text-sm text-gray-800">
                      {selectedDevice.nextMaintenanceDate || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedDevice.insuranceExpiry && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">保险信息</span>
                </div>
                <p className="text-sm text-amber-600 mt-1">
                  保险到期日期：{selectedDevice.insuranceExpiry}
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                资产履历
              </h4>
              <div className="relative pl-6 space-y-4 max-h-96 overflow-y-auto pr-2">
                <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200" />
                {(() => {
                  const events: Array<{
                    date: string;
                    type: string;
                    icon: any;
                    color: string;
                    title: string;
                    description?: string;
                  }> = [];

                  events.push({
                    date: selectedDevice.purchaseDate,
                    type: "purchase",
                    icon: Package,
                    color: "bg-blue-500",
                    title: "设备入库",
                    description: `采购价格: ¥${selectedDevice.purchasePrice.toLocaleString()}`,
                  });

                  flightRecords
                    .filter((fr) => fr.deviceId === selectedDevice.id)
                    .forEach((fr) => {
                      events.push({
                        date: fr.date,
                        type: "flight",
                        icon: PlaneTakeoff,
                        color: "bg-green-500",
                        title: `飞行记录: ${fr.missionType}`,
                        description: `时长: ${fr.duration}h · 飞手: ${fr.pilot} · 地点: ${fr.location}`,
                      });
                    });

                  maintenanceTasks
                    .filter((t) => t.deviceId === selectedDevice.id)
                    .forEach((t) => {
                      if (t.status === "completed") {
                        events.push({
                          date: t.completedDate || t.dueDate,
                          type: "maintenance",
                          icon: Wrench,
                          color: "bg-purple-500",
                          title: `维保完成: ${t.type}`,
                          description: t.cost
                            ? `费用: ¥${t.cost.toLocaleString()}`
                            : t.notes,
                        });
                      } else {
                        events.push({
                          date: t.dueDate,
                          type: "maintenance",
                          icon: Wrench,
                          color: "bg-yellow-500",
                          title: `维保计划: ${t.type}`,
                          description: `状态: ${t.status === "overdue" ? "已逾期" : t.status === "in_progress" ? "处理中" : "待处理"}`,
                        });
                      }
                    });

                  tickets
                    .filter((t) => t.deviceId === selectedDevice.id)
                    .forEach((t) => {
                      if (t.isGround) {
                        events.push({
                          date: t.createdAt,
                          type: "ground",
                          icon: XCircle,
                          color: "bg-red-500",
                          title: `故障停飞: ${t.title}`,
                          description: `优先级: ${t.priority} · 上报人: ${t.reporter}`,
                        });
                      }
                      if (t.status === "resolved" || t.status === "closed") {
                        events.push({
                          date: t.createdAt,
                          type: "resolve",
                          icon: CheckCircle2,
                          color: "bg-green-500",
                          title: `故障修复: ${t.title}`,
                          description: t.externalRepair
                            ? `外修费用: ¥${t.externalRepair.cost?.toLocaleString() || 0}`
                            : undefined,
                        });
                      }
                    });

                  inventoryTransactions
                    .filter(
                      (tx) =>
                        tx.deviceId === selectedDevice.id && tx.type === "out"
                    )
                    .forEach((tx) => {
                      const part = spareParts.find(
                        (p) => p.id === tx.sparePartId
                      );
                      events.push({
                        date: tx.date,
                        type: "spare",
                        icon: Package,
                        color: "bg-orange-500",
                        title: `备件领用: ${part?.name || "未知备件"}`,
                        description: `数量: ${tx.quantity}${part?.unit || ""} · 经办人: ${tx.operator}`,
                      });
                    });

                  stockTakes
                    .filter((st) => st.status === "completed")
                    .forEach((st) => {
                      const item = st.items.find(
                        (i) => i.deviceId === selectedDevice.id
                      );
                      if (item) {
                        events.push({
                          date: st.completedAt || st.createdAt,
                          type: "stocktake",
                          icon: ClipboardList,
                          color:
                            item.status === "normal"
                              ? "bg-green-500"
                              : item.status === "damaged"
                              ? "bg-orange-500"
                              : "bg-red-500",
                          title: `资产盘点: ${st.title}`,
                          description: `结果: ${item.status === "normal" ? "正常" : item.status === "damaged" ? "损坏" : "缺失"}${item.notes ? ` · ${item.notes}` : ""}`,
                        });
                      }
                    });

                  return events
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((event, idx) => {
                      const Icon = event.icon;
                      return (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ${event.color} border-2 border-white shadow`}
                          />
                          <div className="ml-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-800">
                                {event.title}
                              </p>
                              <span className="text-xs text-gray-400">
                                {event.date}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedDevice);
                }}
                className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                编辑设备
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="批量导入设备"
        keyField="资产编号"
        keyFieldLabel="资产编号"
        existingItems={devices}
        existingKeyField="assetNumber"
        sampleHeaders={[
          "设备名称",
          "设备类型",
          "型号",
          "序列号",
          "资产编号",
          "采购日期",
          "采购价格",
          "状态",
          "责任人",
          "累计飞行小时",
          "保险到期日",
        ]}
        onImport={handleImportDevices}
      />
    </div>
  );
}
