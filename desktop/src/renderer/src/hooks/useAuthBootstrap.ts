import { useEffect } from "react";
import { isSupabaseConfigured, supabase, toAppUser } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";

/** Restore Supabase session and keep the Zustand auth state in sync. */
export function useAuthBootstrap() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const syncUser = (authenticated: boolean, user?: ReturnType<typeof toAppUser>) => {
      if (authenticated && user) {
        useAppStore.setState({
          user,
          isAuthenticated: true,
        });
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(true, toAppUser(session.user));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUser(true, toAppUser(session.user));
      } else if (_event === "SIGNED_OUT") {
        useAppStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
