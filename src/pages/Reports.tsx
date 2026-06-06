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
  const depreciations = useStore((state) => state.depreciations);
  const [timeRange, setTimeRange] = useState("year");
  const [viewMode, setViewMode] = useState<"device" | "category">("device");

  const totalCost = costRecords.reduce((sum, c) => sum + c.amount, 0);
  const avgMonthlyCost = Math.round(totalCost / 6);

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
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          <Download className="w-5 h-5" />
          导出报表
        </button>
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
    </div>
  );
}
