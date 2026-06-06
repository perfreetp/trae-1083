import { useState } from "react";
import {
  Plus,
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  ExternalLink,
  Lock,
  Unlock,
  Eye,
  UserPlus,
  Send,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { useStore } from "@/store/useStore";
import type {
  TicketStatus,
  TicketPriority,
  Ticket as TicketType,
} from "@/types";

const statusColumns: { status: TicketStatus; label: string; color: string }[] =
  [
    { status: "open", label: "待接单", color: "border-orange-300" },
    { status: "in_progress", label: "处理中", color: "border-blue-300" },
    { status: "pending_parts", label: "待备件", color: "border-purple-300" },
    { status: "external_repair", label: "外修中", color: "border-indigo-300" },
    { status: "resolved", label: "已解决", color: "border-green-300" },
  ];

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const priorityLabels: Record<TicketPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  critical: "紧急",
};

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "待接单" },
  { value: "in_progress", label: "处理中" },
  { value: "pending_parts", label: "待备件" },
  { value: "external_repair", label: "外修中" },
  { value: "resolved", label: "已解决" },
  { value: "closed", label: "已关闭" },
];

const emptyTicket: Omit<TicketType, "id"> = {
  deviceId: "",
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  reporter: "",
  createdAt: new Date().toISOString().split("T")[0],
  isGround: false,
};

export default function Tickets() {
  const {
    tickets,
    devices,
    addTicket,
    updateTicket,
    setDeviceStatus,
  } = useStore();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState<Omit<TicketType, "id">>(emptyTicket);
  const [assignData, setAssignData] = useState({ assignee: "" });
  const [externalData, setExternalData] = useState({
    vendor: "",
    sentDate: new Date().toISOString().split("T")[0],
    trackingNumber: "",
    cost: 0,
  });

  const handleCreateSubmit = () => {
    if (!formData.deviceId || !formData.title || !formData.reporter) {
      alert("请填写设备、标题和报告人");
      return;
    }
    addTicket(formData);
    setIsCreateModalOpen(false);
    setFormData(emptyTicket);
  };

  const handleAssign = () => {
    if (!selectedTicket || !assignData.assignee) {
      alert("请填写处理人");
      return;
    }
    updateTicket(selectedTicket.id, {
      assignee: assignData.assignee,
      status: "in_progress",
    });
    setIsAssignModalOpen(false);
    setSelectedTicket(null);
  };

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    updateTicket(ticketId, { status });
  };

  const handleExternalRepair = () => {
    if (!selectedTicket || !externalData.vendor) {
      alert("请填写外修厂商");
      return;
    }
    updateTicket(selectedTicket.id, {
      status: "external_repair",
      externalRepair: {
        vendor: externalData.vendor,
        sentDate: externalData.sentDate,
        trackingNumber: externalData.trackingNumber,
        cost: externalData.cost,
      },
    });
    setIsExternalModalOpen(false);
    setSelectedTicket(null);
  };

  const handleGroundDevice = (
    ticketId: string,
    deviceId: string,
    isGround: boolean
  ) => {
    updateTicket(ticketId, { isGround: !isGround });
    setDeviceStatus(deviceId, !isGround ? "grounded" : "active");
  };

  const openDetailModal = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const openAssignModal = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setAssignData({ assignee: ticket.assignee || "" });
    setIsAssignModalOpen(true);
  };

  const openExternalModal = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setExternalData({
      vendor: ticket.externalRepair?.vendor || "",
      sentDate:
        ticket.externalRepair?.sentDate ||
        new Date().toISOString().split("T")[0],
      trackingNumber: ticket.externalRepair?.trackingNumber || "",
      cost: ticket.externalRepair?.cost || 0,
    });
    setIsExternalModalOpen(true);
  };

  const renderTicketCard = (ticket: TicketType) => {
    const device = devices.find((d) => d.id === ticket.deviceId);
    return (
      <div
        key={ticket.id}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
        onClick={() => openDetailModal(ticket)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}
            >
              {priorityLabels[ticket.priority]}
            </span>
            {ticket.isGround && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                <Lock className="w-3 h-3" />
                已停飞
              </span>
            )}
            {ticket.status === "external_repair" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                <ExternalLink className="w-3 h-3" />
                外修中
              </span>
            )}
          </div>
        </div>
        <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">
          {ticket.title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {ticket.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{device?.name || "未知设备"}</span>
          <span>{ticket.createdAt}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs">
              {(ticket.assignee || ticket.reporter).charAt(0)}
            </div>
            <span className="text-xs text-gray-600">
              {ticket.assignee || "未分配"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "board"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              看板视图
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              列表视图
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setFormData(emptyTicket);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          创建工单
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">待接单</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {tickets.filter((t) => t.status === "open").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">处理中</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {tickets.filter((t) => t.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">待备件</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {tickets.filter((t) => t.status === "pending_parts").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">外修中</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {tickets.filter((t) => t.status === "external_repair").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">已解决</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {
              tickets.filter(
                (t) => t.status === "resolved" || t.status === "closed"
              ).length
            }
          </p>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statusColumns.map((column) => (
            <div key={column.status} className="space-y-3">
              <div
                className={`bg-white rounded-t-xl p-3 border-t-4 ${column.color}`}
              >
                <h3 className="font-medium text-gray-800">{column.label}</h3>
              </div>
              <div className="space-y-3">
                {tickets
                  .filter((t) => t.status === column.status)
                  .map(renderTicketCard)}
                {tickets.filter((t) => t.status === column.status)
                  .length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无工单
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    工单信息
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    设备
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    优先级
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    状态
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    处理人
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    创建时间
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const device = devices.find(
                    (d) => d.id === ticket.deviceId
                  );
                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {device?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}
                        >
                          {priorityLabels[ticket.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs">
                            {(ticket.assignee || "-").charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {ticket.assignee || "未分配"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ticket.createdAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(ticket)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAssignModal(ticket)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600"
                            title="派单"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleGroundDevice(
                                ticket.id,
                                ticket.deviceId,
                                ticket.isGround
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              ticket.isGround
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                            title={ticket.isGround ? "复飞确认" : "停飞锁定"}
                          >
                            {ticket.isGround ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="创建故障工单"
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
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.model})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                优先级
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">紧急</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              故障标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="简要描述故障问题"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              故障详情描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请详细描述故障现象、发生时间、操作环境等..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                报告人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reporter}
                onChange={(e) =>
                  setFormData({ ...formData, reporter: e.target.value })
                }
                placeholder="故障发现人姓名"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGround}
                  onChange={(e) =>
                    setFormData({ ...formData, isGround: e.target.checked })
                  }
                  className="rounded text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  立即锁定该设备（停飞）
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleCreateSubmit}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            提交工单
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="工单详情"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[selectedTicket.priority]}`}
                  >
                    优先级: {priorityLabels[selectedTicket.priority]}
                  </span>
                  <StatusBadge status={selectedTicket.status} />
                  {selectedTicket.isGround && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      <Lock className="w-3 h-3" />
                      已停飞
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedTicket.title}
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {selectedTicket.id}
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                故障描述
              </h4>
              <p className="text-sm text-gray-600">
                {selectedTicket.description || "无描述"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  基本信息
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">关联设备</span>
                    <span className="text-sm text-gray-800">
                      {devices.find((d) => d.id === selectedTicket.deviceId)
                        ?.name || "未知"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">报告人</span>
                    <span className="text-sm text-gray-800">
                      {selectedTicket.reporter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">处理人</span>
                    <span className="text-sm text-gray-800">
                      {selectedTicket.assignee || "未分配"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">创建时间</span>
                    <span className="text-sm text-gray-800">
                      {selectedTicket.createdAt}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  状态操作
                </h4>
                <div className="space-y-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedTicket.id,
                        e.target.value as TicketStatus
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        openAssignModal(selectedTicket);
                      }}
                      className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm hover:bg-primary-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      派单
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        openExternalModal(selectedTicket);
                      }}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      外修
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      handleGroundDevice(
                        selectedTicket.id,
                        selectedTicket.deviceId,
                        selectedTicket.isGround
                      )
                    }
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 ${
                      selectedTicket.isGround
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {selectedTicket.isGround ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        复飞确认
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        停飞锁定
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {selectedTicket.externalRepair && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h4 className="text-sm font-medium text-indigo-800 mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  外修信息
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-600">外修厂商: </span>
                    <span className="text-indigo-800">
                      {selectedTicket.externalRepair.vendor}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-600">寄出日期: </span>
                    <span className="text-indigo-800">
                      {selectedTicket.externalRepair.sentDate || "-"}
                    </span>
                  </div>
                  {selectedTicket.externalRepair.trackingNumber && (
                    <div>
                      <span className="text-indigo-600">物流单号: </span>
                      <span className="text-indigo-800 font-mono">
                        {selectedTicket.externalRepair.trackingNumber}
                      </span>
                    </div>
                  )}
                  {selectedTicket.externalRepair.cost !== undefined && (
                    <div>
                      <span className="text-indigo-600">外修费用: </span>
                      <span className="text-indigo-800 font-medium">
                        ¥{selectedTicket.externalRepair.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="工单派单"
        size="sm"
      >
        <div className="space-y-4">
          {selectedTicket && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">
                {selectedTicket.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                设备:{" "}
                {devices.find((d) => d.id === selectedTicket.deviceId)?.name ||
                  "未知"}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              指定处理人
            </label>
            <input
              type="text"
              value={assignData.assignee}
              onChange={(e) =>
                setAssignData({ ...assignData, assignee: e.target.value })
              }
              placeholder="请输入处理人姓名"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsAssignModalOpen(false)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            确认派单
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
        title="外修登记"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                外修厂商 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={externalData.vendor}
                onChange={(e) =>
                  setExternalData({ ...externalData, vendor: e.target.value })
                }
                placeholder="维修厂商名称"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                寄出日期
              </label>
              <input
                type="date"
                value={externalData.sentDate}
                onChange={(e) =>
                  setExternalData({ ...externalData, sentDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                物流单号
              </label>
              <input
                type="text"
                value={externalData.trackingNumber}
                onChange={(e) =>
                  setExternalData({
                    ...externalData,
                    trackingNumber: e.target.value,
                  })
                }
                placeholder="快递/物流单号"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                预估费用（元）
              </label>
              <input
                type="number"
                min="0"
                value={externalData.cost}
                onChange={(e) =>
                  setExternalData({
                    ...externalData,
                    cost: Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsExternalModalOpen(false)}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleExternalRepair}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            确认外修
          </button>
        </div>
      </Modal>
    </div>
  );
}
