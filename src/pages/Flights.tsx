import { useState } from "react";
import { Plus, Calendar, MapPin, User, Clock, PlaneTakeoff } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Flights() {
  const flightRecords = useStore((state) => state.flightRecords);
  const devices = useStore((state) => state.devices);
  const [dateRange, setDateRange] = useState("month");

  const totalHours = flightRecords.reduce((sum, f) => sum + f.duration, 0);
  const totalFlights = flightRecords.length;
  const totalTakeoffs = flightRecords.reduce((sum, f) => sum + f.takeoffs, 0);
  const uniquePilots = [...new Set(flightRecords.map((f) => f.pilot))].length;

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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
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
          {flightRecords.map((record) => {
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
                      <div className="flex items-center gap-2">
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
                        <p className="text-sm text-gray-500 mt-2">
                          {record.notes}
                        </p>
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
          })}
        </div>
      </div>
    </div>
  );
}
