import './Header.css'
import { Box, Text, useColorMode } from "@chakra-ui/react";
import HeaderDark from '../../assets/HeaderDark.svg?react';
import HeaderLight from '../../assets/HeaderLight.svg?react';
import { useSupabase } from '../../hooks/useSupabase';
import ToggleDarkMode from '../ToggleDarkMode';
import { NavLink, useNavigate } from 'react-router-dom';
import Paths from '../../router/paths';

const Header = () => {
  const { colorMode } = useColorMode();
  const { supabase, session } = useSupabase();
  const navigate = useNavigate()

  const handleSignout = () => {
    supabase.auth.signOut();
    navigate('/');
  }

  return (
    <Box as="header" display="flex" alignItems="center" justifyContent="space-between" className="main" bg="background">
      {colorMode == "dark" ? <HeaderDark width="240" height="100" className="header-logo"/> : <HeaderLight width="240" height="100" className="header-logo"/> }
      <Box className='menu-container'>
        <NavLink to={Paths.home}>About Us </NavLink>
        <NavLink to={Paths.home}>Report</NavLink>
        <NavLink to={Paths.dashboard}>Dashboard</NavLink>
        {session ? 
          <Text onClick={handleSignout} className='menu-item'>Sign Out</Text> :
          <NavLink to={Paths.login}>Sign In</NavLink>
        }
        <ToggleDarkMode />
      </Box>
    </Box>
  )
};

export default Header;
