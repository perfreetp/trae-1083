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
  X,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useStore } from "@/store/useStore";
import type { SparePart } from "@/types";

const emptyPart: Omit<SparePart, "id"> = {
  name: "",
  category: "电子元器件",
  sku: "",
  stock: 0,
  safetyStock: 5,
  unit: "个",
  unitPrice: 0,
  location: "",
};

export default function Inventory() {
  const {
    spareParts,
    inventoryTransactions,
    updateSparePartStock,
    addSparePart,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [isInModalOpen, setIsInModalOpen] = useState(false);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [stockForm, setStockForm] = useState({
    quantity: 1,
    operator: "",
    notes: "",
  });
  const [partForm, setPartForm] = useState<Omit<SparePart, "id">>(emptyPart);

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

  const handleStockIn = () => {
    if (!selectedPart || !stockForm.operator) {
      alert("请填写经办人");
      return;
    }
    if (stockForm.quantity <= 0) {
      alert("数量必须大于 0");
      return;
    }
    const success = updateSparePartStock(
      selectedPart.id,
      stockForm.quantity,
      "in",
      stockForm.operator,
      stockForm.notes
    ) as unknown as boolean;
    if (success !== false) {
      setIsInModalOpen(false);
      setSelectedPart(null);
      setStockForm({ quantity: 1, operator: "", notes: "" });
    }
  };

  const handleStockOut = () => {
    if (!selectedPart || !stockForm.operator) {
      alert("请填写经办人");
      return;
    }
    if (stockForm.quantity <= 0) {
      alert("数量必须大于 0");
      return;
    }
    if (selectedPart.stock < stockForm.quantity) {
      alert("库存不足，无法出库");
      return;
    }
    const success = updateSparePartStock(
      selectedPart.id,
      stockForm.quantity,
      "out",
      stockForm.operator,
      stockForm.notes
    ) as unknown as boolean;
    if (success !== false) {
      setIsOutModalOpen(false);
      setSelectedPart(null);
      setStockForm({ quantity: 1, operator: "", notes: "" });
    }
  };

  const handleAddPart = () => {
    if (!partForm.name || !partForm.sku) {
      alert("请填写备件名称和 SKU");
      return;
    }
    addSparePart(partForm);
    setIsAddPartModalOpen(false);
    setPartForm(emptyPart);
  };

  const openInModal = (part: SparePart) => {
    setSelectedPart(part);
    setStockForm({ quantity: 1, operator: "", notes: "" });
    setIsInModalOpen(true);
  };

  const openOutModal = (part: SparePart) => {
    setSelectedPart(part);
    setStockForm({ quantity: 1, operator: "", notes: "" });
    setIsOutModalOpen(true);
  };

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
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <History className="w-5 h-5" />
            出入库记录
          </button>
          <button
            onClick={() => {
              setPartForm(emptyPart);
              setIsAddPartModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
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
              <p className="text-2xl font-bold text-gray-800">
                {spareParts.length}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">
                {lowStockCount}
              </p>
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
                          <p className="font-medium text-gray-800">
                            {part.name}
                          </p>
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
                      <span className="text-sm text-gray-600">
                        {part.category}
                      </span>
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
                          onClick={() => openInModal(part)}
                          className="p-1.5 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                          title="入库"
                        >
                          <ArrowDownCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openOutModal(part)}
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

      <Modal
        isOpen={isInModalOpen}
        onClose={() => setIsInModalOpen(false)}
        title="备件入库"
        size="sm"
      >
        {selectedPart && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                {selectedPart.name}
              </p>
              <p className="text-xs text-green-600">
                当前库存: {selectedPart.stock} {selectedPart.unit}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                入库数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={stockForm.quantity}
                onChange={(e) =>
                  setStockForm({
                    ...stockForm,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                经办人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stockForm.operator}
                onChange={(e) =>
                  setStockForm({ ...stockForm, operator: e.target.value })
                }
                placeholder="经办人姓名"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                备注
              </label>
              <textarea
                value={stockForm.notes}
                onChange={(e) =>
                  setStockForm({ ...stockForm, notes: e.target.value })
                }
                placeholder="入库说明..."
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsInModalOpen(false)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleStockIn}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            确认入库
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isOutModalOpen}
        onClose={() => setIsOutModalOpen(false)}
        title="备件出库"
        size="sm"
      >
        {selectedPart && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800">
                {selectedPart.name}
              </p>
              <p className="text-xs text-orange-600">
                当前库存: {selectedPart.stock} {selectedPart.unit}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                出库数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedPart.stock}
                value={stockForm.quantity}
                onChange={(e) =>
                  setStockForm({
                    ...stockForm,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {stockForm.quantity > selectedPart.stock && (
                <p className="text-xs text-red-500 mt-1">库存不足</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                经办人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stockForm.operator}
                onChange={(e) =>
                  setStockForm({ ...stockForm, operator: e.target.value })
                }
                placeholder="经办人姓名"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                备注
              </label>
              <textarea
                value={stockForm.notes}
                onChange={(e) =>
                  setStockForm({ ...stockForm, notes: e.target.value })
                }
                placeholder="领用说明..."
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsOutModalOpen(false)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleStockOut}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            确认出库
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="出入库记录"
        size="xl"
      >
        <div className="space-y-4">
          {inventoryTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无出入库记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      日期
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      类型
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      备件
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                      数量
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      经办人
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryTransactions.map((tx) => {
                    const part = spareParts.find(
                      (p) => p.id === tx.sparePartId
                    );
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tx.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              tx.type === "in"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {tx.type === "in" ? "入库" : "出库"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {part?.name || "未知备件"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                          {tx.type === "in" ? "+" : "-"}
                          {tx.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tx.operator}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {tx.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        title="新增备件"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                备件名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partForm.name}
                onChange={(e) =>
                  setPartForm({ ...partForm, name: e.target.value })
                }
                placeholder="如：螺旋桨"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                SKU编码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partForm.sku}
                onChange={(e) =>
                  setPartForm({ ...partForm, sku: e.target.value })
                }
                placeholder="如：SP-PROP-001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                分类
              </label>
              <select
                value={partForm.category}
                onChange={(e) =>
                  setPartForm({ ...partForm, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="电子元器件">电子元器件</option>
                <option value="结构件">结构件</option>
                <option value="动力系统">动力系统</option>
                <option value="电池配件">电池配件</option>
                <option value="云台相机">云台相机</option>
                <option value="遥控器">遥控器</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                单位
              </label>
              <input
                type="text"
                value={partForm.unit}
                onChange={(e) =>
                  setPartForm({ ...partForm, unit: e.target.value })
                }
                placeholder="个/套/组"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                初始库存
              </label>
              <input
                type="number"
                min="0"
                value={partForm.stock}
                onChange={(e) =>
                  setPartForm({
                    ...partForm,
                    stock: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                安全库存
              </label>
              <input
                type="number"
                min="0"
                value={partForm.safetyStock}
                onChange={(e) =>
                  setPartForm({
                    ...partForm,
                    safetyStock: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                单价（元）
              </label>
              <input
                type="number"
                min="0"
                value={partForm.unitPrice}
                onChange={(e) =>
                  setPartForm({
                    ...partForm,
                    unitPrice: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              库位
            </label>
            <input
              type="text"
              value={partForm.location}
              onChange={(e) =>
                setPartForm({ ...partForm, location: e.target.value })
              }
              placeholder="如：A架-3层-05"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsAddPartModalOpen(false)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleAddPart}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            保存备件
          </button>
        </div>
      </Modal>
    </div>
  );
}
