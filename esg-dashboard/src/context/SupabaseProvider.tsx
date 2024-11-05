import { createContext, useState, useEffect, ReactNode } from "react";
import { createClient, SupabaseClient, Session } from "@supabase/supabase-js";

interface SupabaseContextProps {
  supabase: SupabaseClient;
  session: Session | null;
}

export const SupabaseContext = createContext<SupabaseContextProps | undefined>(undefined);
const supabase = createClient(
    import.meta.env.REACT_APP_VITE_SUPABASE_URL,
    import.meta.env.REACT_APP_VITE_SUPABASE_ANON_KEY
);
console.log('xx', 'created client');

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {

  const [session, setSession] = useState<Session| null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
};
