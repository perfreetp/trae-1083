import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  PlaneTakeoff,
  BatteryFull,
  Wrench,
  Ticket,
  Package,
  BarChart3,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "资产总览" },
  { path: "/devices", icon: Cpu, label: "设备档案" },
  { path: "/flights", icon: PlaneTakeoff, label: "飞行记录" },
  { path: "/batteries", icon: BatteryFull, label: "电池寿命" },
  { path: "/maintenance", icon: Wrench, label: "维保计划" },
  { path: "/tickets", icon: Ticket, label: "故障工单" },
  { path: "/inventory", icon: Package, label: "备件库存" },
  { path: "/reports", icon: BarChart3, label: "成本报表" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-800 text-white flex flex-col z-50">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">无人机机队</h1>
            <p className="text-xs text-primary-200">资产与维保系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary-500 text-white shadow-lg"
                  : "text-primary-100 hover:bg-primary-700 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold">
            管
          </div>
          <div>
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-primary-300">admin@uav.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
