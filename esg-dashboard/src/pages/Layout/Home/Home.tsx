import "./Home.css";
import { Box, Text } from "@chakra-ui/react";
import Laptop from "../../../assets/laptop.svg?react";
import DashboardScreen1 from "../../../assets/DashboardScreen1.png";
import { useSupabase } from "../../../hooks/useSupabase";

const Home = () => {
  const { session } = useSupabase();
  const user = session?.user.user_metadata.name ?? "Admin";
  return (
    <Box className="home-main" bg="background">
      <div className="welcome-msg-container">
        {session ? (
          <Text className="home-header">Welcome back, {user}</Text>
        ) : (
          <Text className="home-header">Welcome to ESGlytics</Text>
        )}
        <Text
          className="home-subheader"
          fontSize="28"
          color="accent"
          fontWeight="900"
          mt="24px"
          mb="24px"
        >
          All your ESG data in one place
        </Text>
        <Text className="home-subtext">Faster Insights</Text>
        <Text className="home-subtext">=</Text>
        <Text className="home-subtext">Smarter Sustainable Investment</Text>
      </div>

      <div className="laptop-container">
        <Laptop />
        <div className="laptop-screen">
          {/* test */}
          <img
            src={DashboardScreen1}
            alt="Dashboard Screen"
            className="dashboard-screen"
          />
        </div>
      </div>
    </Box>
  );
};

export default Home;
