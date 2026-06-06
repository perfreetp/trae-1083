import { useState } from "react";
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, Wrench, User } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useStore } from "@/store/useStore";
import type { MaintenanceStatus } from "@/types";

export default function Maintenance() {
  const maintenanceTasks = useStore((state) => state.maintenanceTasks);
  const devices = useStore((state) => state.devices);
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | "all">("all");

  const filteredTasks = maintenanceTasks.filter(
    (task) => filterStatus === "all" || task.status === filterStatus
  );

  const pendingCount = maintenanceTasks.filter((t) => t.status === "pending").length;
  const inProgressCount = maintenanceTasks.filter((t) => t.status === "in_progress").length;
  const completedCount = maintenanceTasks.filter((t) => t.status === "completed").length;
  const overdueCount = maintenanceTasks.filter((t) => t.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MaintenanceStatus | "all")}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="completed">已完成</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          新增维保计划
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-sm text-gray-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
              <p className="text-sm text-gray-500">处理中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
              <p className="text-sm text-gray-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{overdueCount}</p>
              <p className="text-sm text-gray-500">已逾期</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTasks.map((task) => {
            const device = devices.find((d) => d.id === task.deviceId);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
            
            return (
              <div
                key={task.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  isOverdue ? "bg-red-50/50" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-600"
                          : task.status === "overdue"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{task.type}</h4>
                        <StatusBadge status={task.status} />
                        {isOverdue && task.status !== "completed" && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            已逾期
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          设备: {device?.name || "未知"}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          负责人: {task.assignee || "未分配"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">截止: {task.dueDate}</span>
                    </div>
                    {task.completedDate && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>完成: {task.completedDate}</span>
                      </div>
                    )}
                    {task.cost !== undefined && (
                      <span className="text-sm font-medium text-gray-700">
                        费用: ¥{task.cost.toLocaleString()}
                      </span>
                    )}
                    <div className="flex gap-2">
                      {task.status !== "completed" && (
                        <button className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                          处理
                        </button>
                      )}
                      <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到匹配的维保任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
