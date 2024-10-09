import "./App.css";
import AppRoutes from "./routes";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Header from "./components/Header";
import { useSupabase } from "./hooks/useSupabase";
import { useColorMode } from "@chakra-ui/react";

export default function App() {
  const { supabase, session } = useSupabase()
  const { colorMode } = useColorMode();

  if (!session) {
    return (
      <div className="app-root">
        <Header />
        <div className="auth-container">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            theme={colorMode}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="app-root">
        <Header />
        <AppRoutes />
      </div>
    );
  }
}
