import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  AlertTriangle,
  Zap,
  Activity,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useStore } from "@/store/useStore";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Batteries() {
  const batteries = useStore((state) => state.batteries);
  const devices = useStore((state) => state.devices);

  const avgHealth =
    batteries.length > 0
      ? Math.round(batteries.reduce((sum, b) => sum + b.health, 0) / batteries.length)
      : 0;
  const totalCycles = batteries.reduce((sum, b) => sum + b.cycles, 0);
  const lowHealthCount = batteries.filter((b) => b.health < 70).length;
  const activeCount = batteries.filter((b) => b.status === "active").length;

  const getBatteryIcon = (health: number) => {
    if (health >= 80) return BatteryFull;
    if (health >= 50) return BatteryMedium;
    return BatteryLow;
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600";
    if (health >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 80) return "bg-green-500";
    if (health >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const cyclesData = batteries.map((b) => ({
    name: b.serialNumber.slice(-4),
    cycles: b.cycles,
    health: b.health,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BatteryFull className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{batteries.length}</p>
              <p className="text-sm text-gray-500">电池总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{avgHealth}%</p>
              <p className="text-sm text-gray-500">平均健康度</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalCycles}</p>
              <p className="text-sm text-gray-500">总循环次数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{lowHealthCount}</p>
              <p className="text-sm text-gray-500">健康度预警</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            电池循环次数统计
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cyclesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cycles" name="循环次数">
                  {cyclesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.health >= 80 ? "#10b981" : entry.health >= 50 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            电池健康状态
          </h3>
          <div className="space-y-4">
            {batteries.map((battery) => {
              const Icon = getBatteryIcon(battery.health);
              const device = devices.find((d) => d.id === battery.deviceId);
              return (
                <div
                  key={battery.id}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          battery.health >= 80
                            ? "bg-green-100 text-green-600"
                            : battery.health >= 50
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {battery.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {battery.serialNumber}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          所属: {device?.name || "未分配"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={battery.status} />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">健康度</span>
                      <span className={`text-sm font-semibold ${getHealthColor(battery.health)}`}>
                        {battery.health}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getHealthBgColor(battery.health)}`}
                        style={{ width: `${battery.health}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">循环次数: </span>
                      <span className="font-medium text-gray-700">
                        {battery.cycles} 次
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">充电: {battery.lastChargeDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
