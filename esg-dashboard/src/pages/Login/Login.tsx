import './Login.css'
import { Text, useColorMode } from '@chakra-ui/react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabase } from '../../hooks/useSupabase';
import LoginIllustrationDark from '../../assets/LoginIllustrationDark.svg?react'
import LoginIllustrationLight from '../../assets/LoginIllustrationLight.svg?react'

const Login = () => {
  const { colorMode } = useColorMode();
  const { supabase } = useSupabase();

  return (
    <div className="auth-container">
        <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        theme={colorMode}
        />
        <div className='login-illustration-container'>
          {colorMode == "dark" ? (
            <LoginIllustrationDark className='login-illustration' />
          ) : (
            <LoginIllustrationLight className='login-illustration'/>
          )}
          <Text className='login-subtext'>ESGlytics: All your ESG data in one place</Text>
          <Text className='login-subtext'>Faster insights = Smarter sustainable investments</Text>
        </div>
    </div>
  )
};

export default Login;
