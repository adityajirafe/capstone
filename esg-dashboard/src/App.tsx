import { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./router/AppRoutes";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen width on initial load and on resize
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px can be adjusted for your needs
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="app-root">
      {isMobile ? (
        <div className="mobile-warning">
          <p>This app is best viewed on a desktop.</p>
        </div>
      ) : (
        <AppRoutes />
      )}
    </div>
  );
}
