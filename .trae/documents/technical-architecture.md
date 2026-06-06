# 无人机机队资产与维保管理系统 - 技术架构文档

## 1. 架构设计

```mermaid
graph TD
    subgraph "前端应用"
        A["React 18 + TypeScript"]
        B["Vite 构建工具"]
        C["Tailwind CSS 样式"]
        D["React Router 路由"]
        E["Zustand 状态管理"]
        F["Lucide React 图标"]
        G["Recharts 图表库"]
    end
    
    subgraph "数据层"
        H["Mock 数据层"]
        I["LocalStorage 持久化"]
    end
    
    subgraph "页面层"
        J1["资产总览"]
        J2["设备档案"]
        J3["飞行记录"]
        J4["电池寿命"]
        J5["维保计划"]
        J6["故障工单"]
        J7["备件库存"]
        J8["成本报表"]
    end
    
    subgraph "组件层"
        K1["统计卡片"]
        K2["数据表格"]
        K3["状态标签"]
        K4["模态框"]
        K5["导航栏"]
        K6["表单组件"]
    end
    
    A --> J1
    A --> J2
    A --> J3
    A --> J4
    A --> J5
    A --> J6
    A --> J7
    A --> J8
    J1 --> K1
    J1 --> K2
    J2 --> K2
    J2 --> K3
    J3 --> K2
    J4 --> K1
    J5 --> K3
    J6 --> K4
    J7 --> K2
    J8 --> K1
    A --> D
    A --> E
    A --> H
    H --> I
    J1 --> G
    J8 --> G
```

## 2. 技术栈说明

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **路由管理**：React Router DOM 6
- **状态管理**：Zustand 4
- **图标库**：Lucide React
- **图表库**：Recharts 2
- **数据持久化**：LocalStorage
- **包管理器**：npm

## 3. 路由定义

| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| / | 资产总览 | 仪表盘首页 |
| /devices | 设备档案 | 设备列表和管理 |
| /devices/:id | 设备详情 | 单个设备详情页 |
| /flights | 飞行记录 | 飞行任务记录 |
| /batteries | 电池寿命 | 电池监控管理 |
| /maintenance | 维保计划 | 保养任务管理 |
| /tickets | 故障工单 | 工单处理工作台 |
| /inventory | 备件库存 | 库存管理 |
| /reports | 成本报表 | 成本分析报表 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    DEVICE ||--o{ FLIGHT_RECORD : "用于"
    DEVICE ||--o{ BATTERY : "包含"
    DEVICE ||--o{ MAINTENANCE_TASK : "需要"
    DEVICE ||--o{ TICKET : "产生"
    DEVICE ||--o{ DEPRECIATION : "有"
    TICKET ||--o{ REPAIR_LOG : "有"
    TICKET ||--o{ SPARE_PART_USAGE : "使用"
    SPARE_PART ||--o{ SPARE_PART_USAGE : "被使用"
    SPARE_PART ||--o{ INVENTORY_LOG : "有"
    
    DEVICE {
        string id PK "设备ID"
        string name "设备名称"
        string type "类型: aircraft/battery/payload"
        string model "型号"
        string serialNumber "序列号"
        date purchaseDate "采购日期"
        number purchasePrice "采购价格"
        string status "状态: active/maintenance/grounded"
        string responsiblePerson "责任人"
        string assetNumber "资产编号"
        number totalFlightHours "总飞行小时"
    }
    
    FLIGHT_RECORD {
        string id PK
        string deviceId FK
        date date "飞行日期"
        string pilot "飞手"
        number duration "飞行时长(小时)"
        number takeoffs "起降次数"
        string location "飞行地点"
        string notes "备注"
    }
    
    BATTERY {
        string id PK
        string deviceId FK
        string model "型号"
        number cycles "循环次数"
        number health "健康度%"
        string status "状态"
        date lastChargeDate "上次充电日期"
    }
    
    MAINTENANCE_TASK {
        string id PK
        string deviceId FK
        string type "保养类型"
        date dueDate "到期日期"
        string status "状态: pending/completed"
        date completedDate "完成日期"
        string notes "备注"
    }
    
    TICKET {
        string id PK
        string deviceId FK
        string title "故障标题"
        string description "故障描述"
        string priority "优先级"
        string status "状态"
        string assignee "指派维修员"
        date createdAt "创建时间"
        string isGround "是否停飞"
    }
    
    REPAIR_LOG {
        string id PK
        string ticketId FK
        string action "维修动作"
        date date "维修日期"
        string technician "维修员"
        number cost "维修费用"
        string notes "备注"
    }
    
    SPARE_PART {
        string id PK
        string name "备件名称"
        string category "分类"
        number stock "库存数量"
        number safetyStock "安全库存"
        string unit "单位"
        number unitPrice "单价"
    }
    
    SPARE_PART_USAGE {
        string id PK
        string ticketId FK
        string sparePartId FK
        number quantity "数量"
        date date "领用日期"
    }
    
    INVENTORY_LOG {
        string id PK
        string sparePartId FK
        string type "类型: in/out"
        number quantity "数量"
        date date "日期"
        string operator "操作人"
        string notes "备注"
    }
    
    DEPRECIATION {
        string id PK
        string deviceId FK
        number currentValue "当前价值"
        number depreciationRate "折旧率"
        date calculatedDate "计算日期"
    }
```

### 4.2 初始数据

系统使用 Mock 数据，存储在 LocalStorage 中。

## 5. 项目结构

```
src/
├── components/          # 可复用组件
│   ├── layout/        # 布局组件
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── ui/           # UI 基础组件
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Modal.tsx
│   │   └── Button.tsx
│   └── charts/       # 图表组件
│       ├── LineChart.tsx
│       ├── PieChart.tsx
│       └── BarChart.tsx
├── pages/             # 页面组件
│   ├── Dashboard.tsx
│   ├── Devices.tsx
│   ├── DeviceDetail.tsx
│   ├── Flights.tsx
│   ├── Batteries.tsx
│   ├── Maintenance.tsx
│   ├── Tickets.tsx
│   ├── Inventory.tsx
│   └── Reports.tsx
├── store/             # 状态管理
│   └── useStore.ts
├── data/              # Mock 数据
│   └── mockData.ts
├── types/             # TypeScript 类型
│   └── index.ts
├── utils/             # 工具函数
│   └── helpers.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 6. 核心功能实现要点

### 6.1 状态管理
使用 Zustand 管理全局状态，包含：
- 设备列表状态
- 工单状态
- 库存状态
- 用户偏好设置

### 6.2 数据持久化
使用 Zustand 的 persist 中间件，将核心数据持久化到 LocalStorage。

### 6.3 图表实现
使用 Recharts 实现：
- 设备状态分布饼图
- 维保趋势折线图
- 成本统计柱状图
- 电池健康度环形图
