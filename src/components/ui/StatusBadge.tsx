import { cn } from "@/lib/utils";

type StatusType =
  | "active"
  | "maintenance"
  | "grounded"
  | "retired"
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue"
  | "open"
  | "pending_parts"
  | "external_repair"
  | "resolved"
  | "closed"
  | "low"
  | "medium"
  | "high"
  | "critical";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: "在役", className: "bg-green-100 text-green-700" },
  maintenance: { label: "维保中", className: "bg-blue-100 text-blue-700" },
  grounded: { label: "停飞", className: "bg-red-100 text-red-700" },
  retired: { label: "已报废", className: "bg-gray-100 text-gray-700" },
  pending: { label: "待处理", className: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "处理中", className: "bg-blue-100 text-blue-700" },
  completed: { label: "已完成", className: "bg-green-100 text-green-700" },
  overdue: { label: "已逾期", className: "bg-red-100 text-red-700" },
  open: { label: "待接单", className: "bg-orange-100 text-orange-700" },
  pending_parts: { label: "待备件", className: "bg-purple-100 text-purple-700" },
  external_repair: { label: "外修中", className: "bg-indigo-100 text-indigo-700" },
  resolved: { label: "已解决", className: "bg-green-100 text-green-700" },
  closed: { label: "已关闭", className: "bg-gray-100 text-gray-700" },
  low: { label: "低", className: "bg-gray-100 text-gray-700" },
  medium: { label: "中", className: "bg-yellow-100 text-yellow-700" },
  high: { label: "高", className: "bg-orange-100 text-orange-700" },
  critical: { label: "紧急", className: "bg-red-100 text-red-700" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
