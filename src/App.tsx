import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import Flights from "@/pages/Flights";
import Batteries from "@/pages/Batteries";
import Maintenance from "@/pages/Maintenance";
import Tickets from "@/pages/Tickets";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import StockTake from "@/pages/StockTake";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="devices/:id" element={<Devices />} />
          <Route path="flights" element={<Flights />} />
          <Route path="batteries" element={<Batteries />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="stocktake" element={<StockTake />} />
        </Route>
      </Routes>
    </Router>
  );
}
