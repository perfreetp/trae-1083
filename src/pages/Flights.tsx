import { useState } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  User,
  Clock,
  PlaneTakeoff,
  Battery,
  FileText,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Modal from "@/components/ui/Modal";
import type { FlightRecord } from "@/types";

const missionTypes = [
  "巡检作业",
  "测绘航拍",
  "应急救援",
  "物流配送",
  "农林植保",
  "训练飞行",
  "测试飞行",
  "其他",
];

const emptyRecord: Omit<FlightRecord, "id"> = {
  deviceId: "",
  date: new Date().toISOString().split("T")[0],
  pilot: "",
  duration: 0,
  takeoffs: 1,
  location: "",
  missionType: "巡检作业",
  notes: "",
  batteryIds: [],
};

export default function Flights() {
  const { flightRecords, devices, batteries, addFlightRecord } = useStore();
  const [dateRange, setDateRange] = useState("month");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<FlightRecord, "id">>(emptyRecord);

  const totalHours = flightRecords.reduce((sum, f) => sum + f.duration, 0);
  const totalFlights = flightRecords.length;
  const totalTakeoffs = flightRecords.reduce((sum, f) => sum + f.takeoffs, 0);
  const uniquePilots = [...new Set(flightRecords.map((f) => f.pilot))].length;

  const availableDevices = devices.filter((d) => d.status === "active");

  const handleSubmit = () => {
    if (!formData.deviceId || !formData.pilot || !formData.location) {
      alert("请填写设备、飞手和地点");
      return;
    }
    if (formData.duration <= 0) {
      alert("飞行时长必须大于 0");
      return;
    }
    addFlightRecord(formData);
    setIsAddModalOpen(false);
    setFormData(emptyRecord);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setFormData(emptyRecord);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          新增飞行记录
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {totalHours.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">总飞行时长 (h)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalFlights}</p>
              <p className="text-sm text-gray-500">飞行架次</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalTakeoffs}</p>
              <p className="text-sm text-gray-500">总起降次数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{uniquePilots}</p>
              <p className="text-sm text-gray-500">执飞飞手</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">飞行记录列表</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {flightRecords.length === 0 ? (
            <div className="text-center py-12">
              <PlaneTakeoff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无飞行记录</p>
            </div>
          ) : (
            flightRecords.map((record) => {
              const device = devices.find((d) => d.id === record.deviceId);
              return (
                <div
                  key={record.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <PlaneTakeoff className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-800">
                            {device?.name || "未知设备"}
                          </h4>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {record.missionType}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {record.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {record.pilot}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {record.location}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {record.notes}
                          </p>
                        )}
                        {record.batteryIds && record.batteryIds.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Battery className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500">
                              使用电池: {record.batteryIds.length} 块
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {record.duration}h
                        </p>
                        <p className="text-xs text-gray-500">飞行时长</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {record.takeoffs}
                        </p>
                        <p className="text-xs text-gray-500">起降次数</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="登记飞行记录"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                选择设备 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.deviceId}
                onChange={(e) =>
                  setFormData({ ...formData, deviceId: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">请选择设备</option>
                {availableDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.model})
                  </option>
                ))}
              </select>
              {availableDevices.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  暂无可用的在役设备
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                飞行日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                飞手 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pilot}
                onChange={(e) =>
                  setFormData({ ...formData, pilot: e.target.value })
                }
                placeholder="执飞飞手姓名"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                任务类型
              </label>
              <select
                value={formData.missionType}
                onChange={(e) =>
                  setFormData({ ...formData, missionType: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {missionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              飞行地点 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="如：上海市浦东新区XX产业园"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                飞行时长（小时）<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: Number(e.target.value),
                  })
                }
                placeholder="0.0"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                起降次数
              </label>
              <input
                type="number"
                min="1"
                value={formData.takeoffs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    takeoffs: Number(e.target.value),
                  })
                }
                placeholder="1"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              使用电池
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {batteries.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.batteryIds?.includes(b.id) || false}
                    onChange={(e) => {
                      const current = formData.batteryIds || [];
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          batteryIds: [...current, b.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          batteryIds: current.filter((id) => id !== b.id),
                        });
                      }
                    }}
                    className="rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{b.serialNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="飞行任务说明、异常情况等..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            保存记录
          </button>
        </div>
      </Modal>
    </div>
  );
}
