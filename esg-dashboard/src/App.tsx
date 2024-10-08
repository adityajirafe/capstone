import "./App.css";
import AppRoutes from "./routes";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import ToggleDarkMode from "./components/ToggleDarkMode";
import Header from "./components/Header";
import { useSupabase } from "./hooks/useSupabase";

export default function App() {
  const { supabase, session } = useSupabase()

  if (!session) {
    return (
      <div className="app-root">
        <div>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="app-root">
        <Header />
        <AppRoutes />
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        <ToggleDarkMode />
      </div>
    );
  }
}
