"use client";

import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { DEMO_AUTH_AVAILABLE, GOOGLE_CLIENT_ID } from "@/lib/api/config";

interface SignInPanelProps {
  onSignedIn?: () => void;
}

/* The Google script loads only when this panel renders, never on browsing pages. */
export function SignInPanel({ onSignedIn }: SignInPanelProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { signInGoogle, signInDemo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [scriptFailed, setScriptFailed] = useState(false);

  const handleCredential = async (credential: string | undefined) => {
    if (!credential) {
      setError(t("error"));
      return;
    }
    setError(null);
    try {
      await signInGoogle(credential);
      onSignedIn?.();
    } catch {
      setError(t("error"));
    }
  };

  if (DEMO_AUTH_AVAILABLE) {
    return (
      <div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            signInDemo(t("demoUser"));
            onSignedIn?.();
          }}
        >
          {t("demoSignIn")}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t("demoHint")}</p>
      </div>
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    return <p className="text-sm text-muted-foreground">{t("notConfigured")}</p>;
  }

  return (
    <div>
      <GoogleOAuthProvider
        clientId={GOOGLE_CLIENT_ID}
        locale={locale}
        onScriptLoadError={() => setScriptFailed(true)}
      >
        <GoogleLogin
          onSuccess={(response) => handleCredential(response.credential)}
          onError={() => setError(t("error"))}
          size="large"
          shape="rectangular"
          text="continue_with"
          width="280"
        />
      </GoogleOAuthProvider>
      {(error || scriptFailed) && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {scriptFailed ? t("googleLoadError") : error}
        </p>
      )}
    </div>
  );
}
