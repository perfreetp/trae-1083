import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Clock,
  Wrench,
  Search,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Modal from "@/components/ui/Modal";
import type { InventoryItemStatus, StockTakeItem, FollowUpStatus } from "@/types";

const STATUS_LABELS: Record<InventoryItemStatus, string> = {
  normal: "正常",
  missing: "缺失",
  damaged: "损坏",
};

const STATUS_COLORS: Record<InventoryItemStatus, string> = {
  normal: "bg-green-100 text-green-700",
  missing: "bg-red-100 text-red-700",
  damaged: "bg-orange-100 text-orange-700",
};

const FOLLOWUP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  pending: "待处理",
  in_progress: "处理中",
  resolved: "已解决",
  closed: "已关闭",
};

const FOLLOWUP_STATUS_COLORS: Record<FollowUpStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

export default function StockTakePage() {
  const devices = useStore((state) => state.devices);
  const stockTakes = useStore((state) => state.stockTakes);
  const addStockTake = useStore((state) => state.addStockTake);
  const updateStockTake = useStore((state) => state.updateStockTake);
  const addTicket = useStore((state) => state.addTicket);
  const setDeviceStatus = useStore((state) => state.setDeviceStatus);
  const updateDevice = useStore((state) => state.updateDevice);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [newStockTake, setNewStockTake] = useState({
    title: "",
    createdBy: "",
    notes: "",
  });
  const [items, setItems] = useState<StockTakeItem[]>([]);

  const handleCreateStockTake = () => {
    if (!newStockTake.title || !newStockTake.createdBy) return;

    const initialItems: StockTakeItem[] = devices.map((d) => ({
      deviceId: d.id,
      status: "normal" as InventoryItemStatus,
      notes: "",
    }));

    addStockTake({
      title: newStockTake.title,
      createdBy: newStockTake.createdBy,
      createdAt: new Date().toISOString().split("T")[0],
      status: "in_progress",
      items: initialItems,
      notes: newStockTake.notes,
    });

    setNewStockTake({ title: "", createdBy: "", notes: "" });
    setShowCreateModal(false);
  };

  const handleViewDetail = (id: string) => {
    const stockTake = stockTakes.find((st) => st.id === id);
    if (stockTake) {
      setItems([...stockTake.items]);
      setShowDetailModal(id);
    }
  };

  const handleUpdateItemStatus = (
    deviceId: string,
    status: InventoryItemStatus
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId ? { ...item, status } : item
      )
    );
  };

  const handleUpdateItemNotes = (deviceId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId ? { ...item, notes } : item
      )
    );
  };

  const handleCompleteStockTake = (id: string) => {
    updateStockTake(id, {
      status: "completed",
      items,
      completedAt: new Date().toISOString().split("T")[0],
    });
    setShowDetailModal(null);
  };

  const getDevice = (deviceId: string) => devices.find((d) => d.id === deviceId);

  const handleCreateTicketFromDamage = (stockTakeId: string, deviceId: string) => {
    const device = getDevice(deviceId);
    if (!device) return;

    addTicket({
      deviceId,
      title: `盘点发现损坏：${device.name}`,
      description: `资产盘点中发现该设备损坏，需要维修处理`,
      status: "open",
      priority: "high",
      reporter: "系统",
      createdAt: new Date().toISOString().split("T")[0],
      isGround: true,
    });

    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId
          ? { ...item, ticketCreated: true, ticketId: "", followUpStatus: "in_progress" as FollowUpStatus }
          : item
      )
    );

    const currentStockTake = stockTakes.find((st) => st.id === stockTakeId);
    if (currentStockTake) {
      const updatedItems = currentStockTake.items.map((item) =>
        item.deviceId === deviceId
          ? { ...item, ticketCreated: true, ticketId: "", followUpStatus: "in_progress" as FollowUpStatus }
          : item
      );
      updateStockTake(stockTakeId, { items: updatedItems });
    }

    alert("已成功创建故障工单并停飞设备");
  };

  const handleUpdateFollowUpStatus = (
    stockTakeId: string,
    deviceId: string,
    status: FollowUpStatus
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId ? { ...item, followUpStatus: status } : item
      )
    );

    const currentStockTake = stockTakes.find((st) => st.id === stockTakeId);
    if (currentStockTake) {
      const updatedItems = currentStockTake.items.map((item) =>
        item.deviceId === deviceId ? { ...item, followUpStatus: status } : item
      );
      updateStockTake(stockTakeId, { items: updatedItems });
    }

    if (status === "resolved") {
      const device = getDevice(deviceId);
      if (device && device.status === "grounded") {
        setDeviceStatus(deviceId, "active");
      }
    }
  };

  const getStatusSummary = (stockTakeItems: StockTakeItem[]) => {
    const normal = stockTakeItems.filter((i) => i.status === "normal").length;
    const missing = stockTakeItems.filter((i) => i.status === "missing").length;
    const damaged = stockTakeItems.filter((i) => i.status === "damaged").length;
    return { normal, missing, damaged, total: stockTakeItems.length };
  };

  const currentStockTake = showDetailModal
    ? stockTakes.find((st) => st.id === showDetailModal)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">资产盘点</h2>
          <p className="text-sm text-gray-500 mt-1">
            管理资产盘点流程，记录盘点结果
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          发起盘点
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stockTakes.length}</p>
              <p className="text-sm text-gray-500">盘点总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {stockTakes.filter((st) => st.status === "in_progress").length}
              </p>
              <p className="text-sm text-gray-500">进行中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {stockTakes.filter((st) => st.status === "completed").length}
              </p>
              <p className="text-sm text-gray-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
              <p className="text-sm text-gray-500">待盘点设备</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">盘点记录</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {stockTakes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无盘点记录</p>
              <p className="text-sm text-gray-400 mt-1">点击"发起盘点"开始第一次盘点</p>
            </div>
          ) : (
            stockTakes.map((stockTake) => {
              const summary = getStatusSummary(stockTake.items);
              return (
                <div
                  key={stockTake.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          stockTake.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {stockTake.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{stockTake.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {stockTake.createdBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {stockTake.createdAt}
                          </span>
                          {stockTake.completedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              完成于 {stockTake.completedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-600">正常 {summary.normal}</span>
                        <span className="text-red-600">缺失 {summary.missing}</span>
                        <span className="text-orange-600">损坏 {summary.damaged}</span>
                      </div>
                      <button
                        onClick={() => handleViewDetail(stockTake.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {stockTake.status === "in_progress" ? "继续盘点" : "查看详情"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="发起资产盘点"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              盘点标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newStockTake.title}
              onChange={(e) =>
                setNewStockTake({ ...newStockTake, title: e.target.value })
              }
              placeholder="例如：2024年第一季度资产盘点"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              盘点人 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newStockTake.createdBy}
              onChange={(e) =>
                setNewStockTake({ ...newStockTake, createdBy: e.target.value })
              }
              placeholder="请输入盘点人姓名"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              value={newStockTake.notes}
              onChange={(e) =>
                setNewStockTake({ ...newStockTake, notes: e.target.value })
              }
              placeholder="盘点说明或备注信息"
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p>本次盘点将包含 {devices.length} 台设备</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreateStockTake}
              disabled={!newStockTake.title || !newStockTake.createdBy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始盘点
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showDetailModal && !!currentStockTake}
        onClose={() => setShowDetailModal(null)}
        title={
          currentStockTake?.status === "completed"
            ? "盘点详情"
            : "资产盘点中"
        }
        size="xl"
      >
        {currentStockTake && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{items.length}</p>
                <p className="text-xs text-gray-500">设备总数</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {items.filter((i) => i.status === "normal").length}
                </p>
                <p className="text-xs text-gray-500">正常</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {items.filter((i) => i.status === "missing").length}
                </p>
                <p className="text-xs text-gray-500">缺失</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {items.filter((i) => i.status === "damaged").length}
                </p>
                <p className="text-xs text-gray-500">损坏</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      设备信息
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      资产编号
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      盘点状态
                    </th>
                    {currentStockTake.status === "completed" && (
                      <>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                          处理状态
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                          后续处理
                        </th>
                      </>
                    )}
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const device = getDevice(item.deviceId);
                    return (
                      <tr key={item.deviceId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {device?.name || "未知设备"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {device?.model} | {device?.serialNumber}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {device?.assetNumber}
                        </td>
                        <td className="px-4 py-3">
                          {currentStockTake.status === "completed" ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          ) : (
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateItemStatus(
                                  item.deviceId,
                                  e.target.value as InventoryItemStatus
                                )
                              }
                              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="normal">正常</option>
                              <option value="missing">缺失</option>
                              <option value="damaged">损坏</option>
                            </select>
                          )}
                        </td>
                        {currentStockTake.status === "completed" && (
                          <>
                            <td className="px-4 py-3">
                              {item.status !== "normal" ? (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.followUpStatus
                                      ? FOLLOWUP_STATUS_COLORS[item.followUpStatus]
                                      : FOLLOWUP_STATUS_COLORS.pending
                                  }`}
                                >
                                  {item.followUpStatus
                                    ? FOLLOWUP_STATUS_LABELS[item.followUpStatus]
                                    : "待处理"}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {item.status === "damaged" && !item.ticketCreated && (
                                <button
                                  onClick={() =>
                                    handleCreateTicketFromDamage(
                                      currentStockTake.id,
                                      item.deviceId
                                    )
                                  }
                                  className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200 transition-colors"
                                >
                                  <Wrench className="w-3 h-3" />
                                  创建工单
                                </button>
                              )}
                              {item.status === "damaged" && item.ticketCreated && (
                                <select
                                  value={item.followUpStatus || "in_progress"}
                                  onChange={(e) =>
                                    handleUpdateFollowUpStatus(
                                      currentStockTake.id,
                                      item.deviceId,
                                      e.target.value as FollowUpStatus
                                    )
                                  }
                                  className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none"
                                >
                                  <option value="pending">待处理</option>
                                  <option value="in_progress">处理中</option>
                                  <option value="resolved">已解决</option>
                                  <option value="closed">已关闭</option>
                                </select>
                              )}
                              {item.status === "missing" && (
                                <select
                                  value={item.followUpStatus || "pending"}
                                  onChange={(e) =>
                                    handleUpdateFollowUpStatus(
                                      currentStockTake.id,
                                      item.deviceId,
                                      e.target.value as FollowUpStatus
                                    )
                                  }
                                  className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none"
                                >
                                  <option value="pending">待追踪</option>
                                  <option value="in_progress">追踪中</option>
                                  <option value="resolved">已找回</option>
                                  <option value="closed">已核销</option>
                                </select>
                              )}
                              {item.status === "normal" && (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          {currentStockTake.status === "completed" ? (
                            <span className="text-sm text-gray-500">
                              {item.notes || "-"}
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={item.notes || ""}
                              onChange={(e) =>
                                handleUpdateItemNotes(item.deviceId, e.target.value)
                              }
                              placeholder="备注"
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {currentStockTake.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  盘点备注
                </p>
                <p className="text-sm text-gray-600 mt-1">{currentStockTake.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {currentStockTake.status === "completed" ? "关闭" : "暂存"}
              </button>
              {currentStockTake.status === "in_progress" && (
                <button
                  onClick={() => handleCompleteStockTake(currentStockTake.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  完成盘点
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
