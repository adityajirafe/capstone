import './Home.css'
import { Box, Text } from '@chakra-ui/react';
import Laptop from '../../../assets/laptop.svg?react'
import DashboardScreen1 from '../../../assets/DashboardScreen1.png';

const Home = () => {

  return (
    <Box className='home-main' bg="background">
      <div className='welcome-msg-container'>
        <Text fontSize="36" fontWeight="bold">Welcome to ESGlytics</Text>
        <Text fontSize="32" color="accent" fontWeight="900" mt="24px" mb="24px">All your ESG data in one place</Text>
        <Text className='home-subtext'>Faster Insights</Text>
        <Text className='home-subtext'>=</Text>
        <Text className='home-subtext'>Smarter Sustainable Investment</Text>
      </div>
      
      <div className='laptop-container'>
        <Laptop/>
        <div className='laptop-screen'>
          {/* test */}
          <img src={DashboardScreen1} alt="Dashboard Screen" className="dashboard-screen" />
        </div>
      </div>
    </Box>
  )
};

export default Home;