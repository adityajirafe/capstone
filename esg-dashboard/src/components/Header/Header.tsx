import './Header.css'
import { Box, Text, useColorMode } from "@chakra-ui/react";
import HeaderDark from '../../assets/HeaderDark.svg?react';
import HeaderLight from '../../assets/HeaderLight.svg?react';
import { useSupabase } from '../../hooks/useSupabase';
import ToggleDarkMode from '../ToggleDarkMode';

const Header = () => {
  const { colorMode } = useColorMode();
  const { supabase, session } = useSupabase();

  return (
    <Box as="header" display="flex" alignItems="center" justifyContent="space-between" className="main" bg="background">
      {colorMode == "dark" ? <HeaderDark width="240" height="100" className="header-logo"/> : <HeaderLight width="240" height="100" className="header-logo"/> }
      <Box className='menu-container'>
        <Text onClick={() => {}} className='menu-item' fontSize="md">About Us</Text>
        <Text onClick={() => {}} className='menu-item' fontSize="md">Report</Text>
        <Text onClick={() => {}} className='menu-item' fontSize="md">Dashboard</Text>
        {session ? 
          <Text onClick={() => supabase.auth.signOut()} className='menu-item' fontSize="md">Sign Out</Text> :
          <Text onClick={() => {}} className='menu-item' fontSize="md">Sign In</Text>
        }
        <ToggleDarkMode />
      </Box>
    </Box>
  )
};

export default Header;
