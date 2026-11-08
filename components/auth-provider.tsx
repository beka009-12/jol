"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signInWithGoogle, TOKEN_KEY } from "@/lib/api/client";
import { DEMO_TOKEN } from "@/lib/api/config";
import type { User } from "@/lib/types";

const USER_KEY = "jol.user";
const CHANGE_EVENT = "jol:auth-change";

interface AuthSnapshot {
  token: string | null;
  userJson: string | null;
}

let cached: AuthSnapshot = { token: null, userJson: null };

function readSnapshot(): AuthSnapshot {
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const userJson = window.localStorage.getItem(USER_KEY);
    if (token !== cached.token || userJson !== cached.userJson) {
      cached = { token, userJson };
    }
  } catch {
    // Storage blocked: stay signed out instead of breaking the page.
  }
  return cached;
}

const SERVER_SNAPSHOT: AuthSnapshot = { token: null, userJson: null };

function subscribe(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function writeSession(token: string | null, user: User | null): void {
  try {
    if (token && user) {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Storage blocked: the session lasts only until the next read.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parseUser(json: string | null): User | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as User;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: User | null;
  isSignedIn: boolean;
  /** False during server render and hydration, before storage can be read. */
  isReady: boolean;
  signInGoogle: (idToken: string) => Promise<void>;
  signInDemo: (name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeReady(): () => void {
  return () => {};
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const isReady = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );

  const signInGoogle = useCallback(async (idToken: string) => {
    const { access_token, user } = await signInWithGoogle(idToken);
    writeSession(access_token, user);
  }, []);

  const signInDemo = useCallback((name: string) => {
    writeSession(DEMO_TOKEN, {
      id: "demo",
      email: "demo@jol.example",
      name,
      avatar_url: null,
      created_at: new Date().toISOString(),
    });
  }, []);

  const signOut = useCallback(() => {
    writeSession(null, null);
    // An open chat survives an expired token: it resumes after signing back in.
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "conversation",
    });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: parseUser(snapshot.userJson),
      isSignedIn: Boolean(snapshot.token),
      isReady,
      signInGoogle,
      signInDemo,
      signOut,
    }),
    [snapshot, isReady, signInGoogle, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
