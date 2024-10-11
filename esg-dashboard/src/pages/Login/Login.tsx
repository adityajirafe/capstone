import './Login.css'
import { useColorMode } from '@chakra-ui/react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabase } from '../../hooks/useSupabase';

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
    </div>
  )
};

export default Login;
