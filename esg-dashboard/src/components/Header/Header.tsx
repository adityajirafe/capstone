import "./Header.css";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import HeaderDark from "../../assets/HeaderDark.svg?react";
import HeaderLight from "../../assets/HeaderLight.svg?react";
import { useSupabase } from "../../hooks/useSupabase";
import ToggleDarkMode from "../ToggleDarkMode";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Paths from "../../router/paths";

const Header = () => {
  const { colorMode } = useColorMode();
  const { supabase, session } = useSupabase();
  const navigate = useNavigate();
  const [userGroup, setUserGroup] = useState<string | null>(null);

  // Fetch user group if the user is logged in
  useEffect(() => {
    const fetchUserGroup = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user group:", error.message);
        } else {
          setUserGroup(data?.role || null); // Set user group
        }
      }
    };

    fetchUserGroup();
  }, [session, supabase]);

  const handleSignout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate(Paths.home);
  };

  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      className="main"
      bg="headerBackground"
    >
      <div onClick={handleLogoClick}>
        {colorMode === "dark" ? (
          <HeaderDark className="header-logo" />
        ) : (
          <HeaderLight className="header-logo" />
        )}
      </div>
      <Box className="menu-container">
        <NavLink
          to={Paths.home + "#about-us"}
          className={({ isActive }) =>
            isActive && location.hash === "#about-us" ? "active" : ""
          }
        >
          About Us
        </NavLink>
        {userGroup === "ENTERPRISE" && (
          <NavLink to={Paths.dataEntry}>Reporting</NavLink>
        )}
        <NavLink to={Paths.dashboard}>Dashboard</NavLink>
        {session ? (
          <Text onClick={handleSignout} className="menu-item">
            Sign Out
          </Text>
        ) : (
          <NavLink to={Paths.login}>Sign In</NavLink>
        )}
        <ToggleDarkMode />
      </Box>
    </Box>
  );
};

export default Header;
