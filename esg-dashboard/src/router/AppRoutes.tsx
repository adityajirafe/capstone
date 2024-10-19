import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, FC } from "react";
import DataInputForm from "../pages/DataForm/DataForm";
import TableauDashboard from "../pages/Dashboard/Dashboard";
import Scraper from "../pages/Scraper/Scraper";
import Layout from "../pages/Layout";
import Login from "../pages/Login";
import { useSupabase } from "../hooks/useSupabase";
import Header from "../components/Header";
import Paths from "./paths";

const ProtectedRoute: FC<{ element: JSX.Element }> = ({ element }) => {
  const { session } = useSupabase();

  if (session === undefined) {
    // Show a loading spinner or similar while the session is being determined
    return <div>Loading...</div>;
  }

  return session ? element : <Navigate to={Paths.login}/>;
};

const AppRoutes: FC = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Ensures that Supabase session is restored before rendering protected routes
      const { data: { session } } = await supabase.auth.getSession();
      setLoading(false);  // Session is determined
      if (!session) {
        return <Navigate to={Paths.home} />
      }
    };

    checkSession();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;  // Replace with a proper loading spinner or UI
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path={Paths.home} element={<Layout />} />
        <Route path={Paths.login} element={<Login />} />
        <Route 
          path={Paths.dataInput}
          element={<ProtectedRoute element={<DataInputForm />} />}
        />
        <Route 
          path={Paths.scraper}
          element={<ProtectedRoute element={<Scraper />} />}
        />
        <Route
          path={Paths.dashboard}
          element={<ProtectedRoute element={<TableauDashboard />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
