import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSupabase,
  toAppUser,
  isSupabaseConfigured,
  isGoogleAuthEnabled,
} from "../../lib/supabase";
import { legalLinks, openLegalLink } from "../../lib/legal-urls";
import {
  recordTermsAcceptance,
  termsAcceptanceMetadata,
} from "../../lib/legal-acceptance";
import { hasDashboardAccess } from "../../lib/dashboard-access";
import { useAppStore } from "../../store/useAppStore";
import { BackButton, PillButton } from "../../components/ui";
import { TermsAgreement } from "../../components/auth/TermsAgreement";

type Mode = "signin" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    void window.ghost?.setDashboardLayout?.("onboarding");
    if (!welcomeComplete) navigate("/welcome", { replace: true });
  }, [welcomeComplete, navigate]);

  const afterAuth = useCallback(
    (
      userEmail: string,
      name?: string,
      isNewAccount = false,
      userId?: string,
      avatar?: string,
    ) => {
      login(userEmail, name, userId, avatar, isNewAccount);
      if (isNewAccount) {
        navigate("/onboarding");
        return;
      }

      const state = useAppStore.getState();
      if (!state.onboardingComplete) {
        navigate("/onboarding");
        return;
      }
      if (!state.shortcutTutorialComplete) {
        navigate("/try");
        return;
      }
      navigate(hasDashboardAccess(state.plan, state.paywallComplete) ? "/" : "/paywall");
    },
    [login, navigate],
  );

  const handleOAuthCallback = useCallback(
    async (url: string) => {
      const supabase = getSupabase();
      if (!supabase) return;

      setError(null);
      setLoading(true);
      try {
        const parsed = new URL(url);
        const oauthError = parsed.searchParams.get("error_description") ?? parsed.searchParams.get("error");
        if (oauthError) {
          setError(decodeURIComponent(oauthError.replace(/\+/g, " ")));
          return;
        }
        const code = parsed.searchParams.get("code");
        if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error || !data.user) {
            setError("OAuth callback failed");
            return;
          }
          const u = toAppUser(data.user);
          const isNew =
            data.user.created_at === data.user.last_sign_in_at;
          if (isNew) {
            await recordTermsAcceptance(u.id);
          }
          afterAuth(u.email, u.name, isNew, u.id, u.avatar);
          return;
        }

        const hashParams = new URLSearchParams(url.split("#")[1] ?? "");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (!accessToken) {
          setError("OAuth callback failed");
          return;
        }
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
        });
        if (error || !data.user) {
          setError("OAuth callback failed");
          return;
        }
        const u = toAppUser(data.user);
        afterAuth(u.email, u.name, false, u.id, u.avatar);
      } catch (e) {
        setError(e instanceof Error ? e.message : "OAuth callback failed");
      } finally {
        setLoading(false);
      }
    },
    [afterAuth],
  );

  useEffect(() => {
    return window.ghost?.onAuthCallback?.((url) => {
      void handleOAuthCallback(url);
    });
  }, [handleOAuthCallback]);

  const requireTermsForSignup = () => {
    if (mode !== "signup") return true;
    if (acceptedTerms) return true;
    setError("Please agree to the Terms of Service and Privacy Policy to continue.");
    return false;
  };

  const handleGoogle = async () => {
    setError(null);
    if (!requireTermsForSignup()) return;
    setLoading(true);
    try {
      if (!configured) {
        afterAuth("demo@ghost.ai", "Demo User");
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        afterAuth("demo@ghost.ai", "Demo User");
        return;
      }
      const googleEnabled = await isGoogleAuthEnabled();
      if (!googleEnabled) {
        throw new Error(
          "Google sign-in is not enabled yet. Ask your admin to enable Google in Supabase Auth and add the OAuth client secret.",
        );
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "ghost://auth/callback",
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data.url) {
        await window.ghost?.openExternal?.(data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!requireTermsForSignup()) return;
    setLoading(true);
    try {
      if (!configured) {
        afterAuth(
          email || "demo@ghost.ai",
          email.split("@")[0],
          mode === "signup",
        );
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        afterAuth(
          email || "demo@ghost.ai",
          email.split("@")[0],
          mode === "signup",
        );
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: termsAcceptanceMetadata(),
          },
        });
        if (error) throw error;
        if (data.user && !data.user.identities?.length) {
          setError("An account with this email already exists. Sign in instead.");
          return;
        }
        if (data.session) {
          const u = toAppUser(data.user!);
          await recordTermsAcceptance(u.id);
          afterAuth(u.email, u.name, true, u.id, u.avatar);
        } else {
          setSent(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const u = toAppUser(data.user);
        afterAuth(u.email, u.name, false, u.id, u.avatar);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="text-4xl">✉️</div>
        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.025em] text-zinc-900">
          Check your email
        </h1>
        <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-zinc-500">
          We sent a confirmation link to{" "}
          <span className="font-medium text-zinc-800">{email}</span>.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 text-[13px] font-medium text-zinc-400 hover:text-zinc-600"
        >
          ← Back
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-zinc-900">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[14px] text-zinc-500">
        {mode === "signup"
          ? "Start closing more deals with Ghost"
          : "Sign in to your Ghost account"}
      </p>

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={loading || (mode === "signup" && !acceptedTerms)}
        className="mt-8 flex h-[44px] w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200 bg-white text-[14px] font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[12px] text-zinc-400">or</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={(e) => void handleEmailAuth(e)} className="flex w-full flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="h-[44px] w-full rounded-full border border-zinc-200 bg-white px-4 text-[14px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={8}
          className="h-[44px] w-full rounded-full border border-zinc-200 bg-white px-4 text-[14px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}

        {mode === "signup" ? (
          <TermsAgreement checked={acceptedTerms} onChange={setAcceptedTerms} />
        ) : null}

        <PillButton
          type="submit"
          disabled={loading || (mode === "signup" && !acceptedTerms)}
          className="mt-1"
        >
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </PillButton>
      </form>

      <p className="mt-5 text-[13px] text-zinc-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setAcceptedTerms(false);
              }}
              className="font-medium text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-600"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setAcceptedTerms(false);
              }}
              className="font-medium text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-600"
            >
              Sign up
            </button>
          </>
        )}
      </p>

      {mode === "signin" ? (
        <p className="mt-8 text-[11px] leading-relaxed text-zinc-400">
          By signing in, you agree to our{" "}
          <button
            type="button"
            onClick={() => openLegalLink(legalLinks.terms)}
            className="text-zinc-500 underline decoration-zinc-300 hover:text-zinc-700"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => openLegalLink(legalLinks.privacy)}
            className="text-zinc-500 underline decoration-zinc-300 hover:text-zinc-700"
          >
            Privacy Policy
          </button>
          .
        </p>
      ) : null}
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-drag relative flex h-screen max-h-screen w-full overflow-y-auto overscroll-contain bg-white px-8">
      <BackButton to="/welcome" />
      <div className="mx-auto flex min-h-full w-full max-w-[320px] flex-col items-center justify-center py-10 text-center">
        {children}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
