import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const pageTitles: Record<string, string> = {
  "/": "资产总览",
  "/devices": "设备档案",
  "/flights": "飞行记录",
  "/batteries": "电池寿命",
  "/maintenance": "维保计划",
  "/tickets": "故障工单",
  "/inventory": "备件库存",
  "/reports": "成本报表",
};

export default function Layout() {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    for (const [key, title] of Object.entries(pageTitles)) {
      if (path === key || path.startsWith(key + "/")) {
        return title;
      }
    }
    return "无人机机队管理系统";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={getPageTitle()} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
