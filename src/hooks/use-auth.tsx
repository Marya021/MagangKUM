import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity-log";

type AppRole = Enums<"app_role">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLoggedUserId = useRef<string | null>(null);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
    setRole(data as AppRole | null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRole(session.user.id), 0);
          if (event === "SIGNED_IN" && lastLoggedUserId.current !== session.user.id) {
            lastLoggedUserId.current = session.user.id;
            setTimeout(() => {
              logActivity({
                action: "login",
                entity: "auth",
                description: `Pengguna ${session.user.email ?? ""} masuk ke sistem`,
              });
            }, 100);
          }
        } else {
          setRole(null);
          lastLoggedUserId.current = null;
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        lastLoggedUserId.current = session.user.id;
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const email = user?.email;
    await logActivity({
      action: "logout",
      entity: "auth",
      description: `Pengguna ${email ?? ""} keluar dari sistem`,
    });
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
