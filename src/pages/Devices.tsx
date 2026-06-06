import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useStore } from "@/store/useStore";
import type { DeviceType } from "@/types";

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

export default function Devices() {
  const devices = useStore((state) => state.devices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DeviceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
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
              onChange={(e) => setFilterType(e.target.value as DeviceType | "all")}
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          新增设备
        </button>
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
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.map((device) => {
                const Icon = typeIcons[device.type];
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/devices/${device.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary-600">
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
    </div>
  );
}
