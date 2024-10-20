import './Layout.css';
import Home from './Home';
import AboutUs from './AboutUs';
import ValueProp from './ValueProp';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#about-us") {
      const aboutUsSection = document.getElementById("about-us");
      if (aboutUsSection) {
        setTimeout(() => {
          aboutUsSection.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    }
  }, [location]);

  return (
    <div className="layout-main">
      <Home />
      <ValueProp />
      <AboutUs />
    </div>
  );
};

export default Layout;
