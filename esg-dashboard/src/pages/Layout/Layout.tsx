import './Layout.css'
import Home from './Home';
import AboutUs from './AboutUs';
import ValueProp from './ValueProp';

const Layout = () => {

  return (
    <div className='layout-main'>
      <Home />
      <ValueProp />
      <AboutUs />
    </div>
  )
};

export default Layout;