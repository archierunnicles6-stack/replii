import { useEffect } from "react";
import { getSupabase, isSupabaseConfigured, toAppUser } from "../lib/supabase";
import { syncPlanFromProfile } from "../services/billing";
import { useAppStore, syncPlanLimitsToMain } from "../store/useAppStore";

/** Restore Supabase session and keep the Zustand auth state in sync. */
export function useAuthBootstrap() {
  useEffect(() => {
    const supabase = getSupabase();
    if (!isSupabaseConfigured() || !supabase) return;

    const syncUser = async (authenticated: boolean, user?: ReturnType<typeof toAppUser>) => {
      if (authenticated && user) {
        useAppStore.getState().setUser(user);
        const remotePlan = await syncPlanFromProfile(user.id);
        if (remotePlan) {
          useAppStore.getState().setPlan(remotePlan);
          syncPlanLimitsToMain();
        }
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void syncUser(true, toAppUser(session.user));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void syncUser(true, toAppUser(session.user));
      } else if (_event === "SIGNED_OUT") {
        useAppStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
