import { useState } from "react";
import {
  Plus,
  Filter,
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useStore } from "@/store/useStore";
import type { TicketStatus, TicketPriority } from "@/types";

const statusColumns: { status: TicketStatus; label: string; color: string }[] = [
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

export default function Tickets() {
  const tickets = useStore((state) => state.tickets);
  const devices = useStore((state) => state.devices);
  const updateTicket = useStore((state) => state.updateTicket);
  const setDeviceStatus = useStore((state) => state.setDeviceStatus);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const handleGroundDevice = (ticketId: string, deviceId: string, isGround: boolean) => {
    updateTicket(ticketId, { isGround: !isGround });
    setDeviceStatus(deviceId, !isGround ? "grounded" : "active");
  };

  const renderTicketCard = (ticket: typeof tickets[0]) => {
    const device = devices.find((d) => d.id === ticket.deviceId);
    return (
      <div
        key={ticket.id}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
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
          </div>
          <span className="text-xs text-gray-400 font-mono">{ticket.id}</span>
        </div>
        <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{ticket.title}</h4>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{device?.name || "未知设备"}</span>
          <span>{ticket.createdAt}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs">
              {(ticket.assignee || ticket.reporter).charAt(0)}
            </div>
            <span className="text-xs text-gray-600">{ticket.assignee || "未分配"}</span>
          </div>
          <div className="flex gap-1">
            {ticket.status === "external_repair" && ticket.externalRepair && (
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-indigo-600" title="外修跟踪">
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleGroundDevice(ticket.id, ticket.deviceId, ticket.isGround)}
              className={`p-1.5 hover:bg-gray-100 rounded-lg ${
                ticket.isGround ? "text-green-600" : "text-red-600"
              }`}
              title={ticket.isGround ? "复飞确认" : "停飞锁定"}
            >
              {ticket.isGround ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
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
            {tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
          </p>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statusColumns.map((column) => (
            <div key={column.status} className="space-y-3">
              <div className={`bg-white rounded-t-xl p-3 border-t-4 ${column.color}`}>
                <h3 className="font-medium text-gray-800">{column.label}</h3>
              </div>
              <div className="space-y-3">
                {tickets
                  .filter((t) => t.status === column.status)
                  .map(renderTicketCard)}
                {tickets.filter((t) => t.status === column.status).length === 0 && (
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
                  const device = devices.find((d) => d.id === ticket.deviceId);
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{ticket.title}</p>
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
                            onClick={() => handleGroundDevice(ticket.id, ticket.deviceId, ticket.isGround)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              ticket.isGround
                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                            title={ticket.isGround ? "复飞确认" : "停飞锁定"}
                          >
                            {ticket.isGround ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
    </div>
  );
}
