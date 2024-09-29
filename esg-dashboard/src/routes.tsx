import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage'
import DataInputForm from './pages/DataForm/DataForm';
import TableauDashboard from './pages/Dashboard/Dashboard';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/data-input" element={<DataInputForm />} />
      <Route path="/dashboard" element={<TableauDashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
