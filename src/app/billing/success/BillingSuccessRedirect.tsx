"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function BillingSuccessRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const plan = searchParams.get("plan");
    const to = searchParams.get("to");
    const sessionId = searchParams.get("session_id");
    if (plan) params.set("plan", plan);
    if (to) params.set("to", to);
    if (sessionId) params.set("session_id", sessionId);
    if (!params.has("to")) params.set("to", "billing");

    const redirectToApp = () => {
      window.location.replace(`ghost://billing/success?${params}`);
    };

    if (sessionId && sessionId !== "{CHECKOUT_SESSION_ID}") {
      void fetch(
        `/api/stripe/sync-from-session?session_id=${encodeURIComponent(sessionId)}`,
      )
        .catch(() => undefined)
        .finally(redirectToApp);
      return;
    }

    redirectToApp();
  }, [searchParams]);

  return null;
}
