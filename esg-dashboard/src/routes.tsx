import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataInputForm from "./pages/DataForm/DataForm";
import TableauDashboard from "./pages/Dashboard/Dashboard";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/data-input" element={<DataInputForm />} />
      <Route path="/" element={<TableauDashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
