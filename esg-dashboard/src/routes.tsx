import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataInputForm from "./pages/DataForm/DataForm";
import TableauDashboard from "./pages/Dashboard/Dashboard";
import Scraper from "./pages/Scraper/Scraper";


const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/data-input" element={<DataInputForm />} />
      <Route path="/scraper" element={<Scraper />} />
      <Route path="/" element={<TableauDashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
