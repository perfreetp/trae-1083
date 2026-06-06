import { useState } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Filter,
  History,
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Inventory() {
  const spareParts = useStore((state) => state.spareParts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = [...new Set(spareParts.map((sp) => sp.category))];

  const filteredParts = spareParts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || part.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = spareParts.reduce(
    (sum, sp) => sum + sp.stock * sp.unitPrice,
    0
  );
  const lowStockCount = spareParts.filter(
    (sp) => sp.stock <= sp.safetyStock
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索备件名称、SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <History className="w-5 h-5" />
            出入库记录
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
            <Plus className="w-5 h-5" />
            新增备件
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{spareParts.length}</p>
              <p className="text-sm text-gray-500">备件种类</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {spareParts.reduce((sum, sp) => sum + sp.stock, 0)}
              </p>
              <p className="text-sm text-gray-500">库存总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{lowStockCount}</p>
              <p className="text-sm text-gray-500">低库存预警</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                ¥{totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">库存总值</p>
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
                  备件信息
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  分类
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  SKU
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  库存
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  安全库存
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  单价
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  库位
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParts.map((part) => {
                const isLowStock = part.stock <= part.safetyStock;
                return (
                  <tr
                    key={part.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isLowStock ? "bg-orange-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{part.name}</p>
                          {isLowStock && (
                            <p className="text-xs text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              库存不足
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{part.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-mono">
                        {part.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          isLowStock ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {part.stock} {part.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {part.safetyStock} {part.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-700">
                        ¥{part.unitPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {part.location || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1.5 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                          title="入库"
                        >
                          <ArrowDownCircle className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-orange-100 rounded-lg text-orange-600 transition-colors"
                          title="出库"
                        >
                          <ArrowUpCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredParts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到匹配的备件</p>
          </div>
        )}
      </div>
    </div>
  );
}
