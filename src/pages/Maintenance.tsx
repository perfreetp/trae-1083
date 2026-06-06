import { useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  User,
  Eye,
  DollarSign,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { useStore } from "@/store/useStore";
import type { MaintenanceStatus, MaintenanceTask } from "@/types";

const maintenanceTypes = [
  "日常保养",
  "定期检查",
  "固件升级",
  "电池校准",
  "部件更换",
  "整机检测",
  "其他",
];

const emptyTask: Omit<MaintenanceTask, "id"> = {
  deviceId: "",
  type: "日常保养",
  description: "",
  dueDate: "",
  status: "pending",
  assignee: "",
  notes: "",
  cost: 0,
};

export default function Maintenance() {
  const {
    maintenanceTasks,
    devices,
    addMaintenanceTask,
    updateMaintenanceTask,
  } = useStore();
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | "all">(
    "all"
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [formData, setFormData] = useState<Omit<MaintenanceTask, "id">>(
    emptyTask
  );
  const [processData, setProcessData] = useState({
    completedDate: new Date().toISOString().split("T")[0],
    cost: 0,
    notes: "",
  });

  const filteredTasks = maintenanceTasks.filter(
    (task) => filterStatus === "all" || task.status === filterStatus
  );

  const pendingCount = maintenanceTasks.filter(
    (t) => t.status === "pending"
  ).length;
  const inProgressCount = maintenanceTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const completedCount = maintenanceTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const overdueCount = maintenanceTasks.filter(
    (t) => t.status === "overdue"
  ).length;

  const handleAddSubmit = () => {
    if (!formData.deviceId || !formData.type || !formData.dueDate) {
      alert("请填写设备、类型和截止日期");
      return;
    }
    addMaintenanceTask(formData);
    setIsAddModalOpen(false);
    setFormData(emptyTask);
  };

  const handleStartProcess = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setProcessData({
      completedDate: new Date().toISOString().split("T")[0],
      cost: task.cost || 0,
      notes: "",
    });
    if (task.status === "pending" || task.status === "overdue") {
      updateMaintenanceTask(task.id, { status: "in_progress" });
    }
    setIsProcessModalOpen(true);
  };

  const handleComplete = () => {
    if (!selectedTask) return;
    updateMaintenanceTask(selectedTask.id, {
      status: "completed",
      completedDate: processData.completedDate,
      cost: processData.cost,
      notes: processData.notes,
    });
    setIsProcessModalOpen(false);
    setSelectedTask(null);
  };

  const openViewModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as MaintenanceStatus | "all")
            }
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="completed">已完成</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
        <button
          onClick={() => {
            setFormData(emptyTask);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
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
              <p className="text-2xl font-bold text-gray-800">
                {pendingCount}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">
                {inProgressCount}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">
                {completedCount}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">
                {overdueCount}
              </p>
              <p className="text-sm text-gray-500">已逾期</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">没有找到匹配的维保任务</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const device = devices.find((d) => d.id === task.deviceId);
              const isOverdue =
                new Date(task.dueDate) < new Date() &&
                task.status !== "completed";

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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-800">
                            {task.type}
                          </h4>
                          <StatusBadge status={task.status} />
                          {isOverdue && task.status !== "completed" && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              已逾期
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
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
                        <span className="text-gray-600">
                          截止: {task.dueDate}
                        </span>
                      </div>
                      {task.completedDate && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>完成: {task.completedDate}</span>
                        </div>
                      )}
                      {task.cost !== undefined && task.cost > 0 && (
                        <span className="text-sm font-medium text-gray-700">
                          费用: ¥{task.cost.toLocaleString()}
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openViewModal(task)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          详情
                        </button>
                        {task.status !== "completed" && (
                          <button
                            onClick={() => handleStartProcess(task)}
                            className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            {task.status === "in_progress"
                              ? "继续处理"
                              : "处理"}
                          </button>
                        )}
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
        title="新增维保计划"
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
                维保类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              维保描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请详细描述维保内容和要求..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                截止日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                负责人
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                placeholder="维保负责人姓名"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              预估费用（元）
            </label>
            <input
              type="number"
              min="0"
              value={formData.cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            onClick={handleAddSubmit}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建计划
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="处理维保任务"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    {selectedTask.type}
                  </h4>
                  <p className="text-sm text-blue-600 mt-1">
                    {selectedTask.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  完成日期
                </label>
                <input
                  type="date"
                  value={processData.completedDate}
                  onChange={(e) =>
                    setProcessData({
                      ...processData,
                      completedDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  实际费用（元）
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={processData.cost}
                    onChange={(e) =>
                      setProcessData({
                        ...processData,
                        cost: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                维保备注
              </label>
              <textarea
                value={processData.notes}
                onChange={(e) =>
                  setProcessData({ ...processData, notes: e.target.value })
                }
                placeholder="记录维保过程、更换部件、发现的问题等..."
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsProcessModalOpen(false)}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            稍后处理
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            标记完成
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="维保详情"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className={`p-4 rounded-xl ${
                  selectedTask.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : selectedTask.status === "in_progress"
                    ? "bg-blue-100 text-blue-600"
                    : selectedTask.status === "overdue"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <Wrench className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedTask.type}
                  </h3>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <p className="text-gray-500 mt-1">
                  设备:{" "}
                  {devices.find((d) => d.id === selectedTask.deviceId)?.name ||
                    "未知"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  基本信息
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">负责人</span>
                    <span className="text-sm text-gray-800">
                      {selectedTask.assignee || "未分配"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">截止日期</span>
                    <span className="text-sm text-gray-800">
                      {selectedTask.dueDate}
                    </span>
                  </div>
                  {selectedTask.completedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">完成日期</span>
                      <span className="text-sm text-green-600 font-medium">
                        {selectedTask.completedDate}
                      </span>
                    </div>
                  )}
                  {selectedTask.cost !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">费用</span>
                      <span className="text-sm text-gray-800 font-medium">
                        ¥{selectedTask.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  维保描述
                </h4>
                <p className="text-sm text-gray-700">
                  {selectedTask.description || "无描述"}
                </p>
              </div>
            </div>

            {selectedTask.notes && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  维保备注
                </h4>
                <p className="text-sm text-gray-600">{selectedTask.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
