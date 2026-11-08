"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

// Replaces the root layout, so it can't rely on translations or global styles.
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#fbfaf8",
          color: "#1a1714",
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>Jol didn’t load</h1>
        <p style={{ marginTop: 8 }}>
          Check your connection and try again. Проверьте соединение и повторите.
        </p>
        <button
          onClick={() => retry()}
          style={{
            height: 44,
            padding: "0 16px",
            border: 0,
            borderRadius: 12,
            background: "#c8261b",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Try again / Повторить
        </button>
      </body>
    </html>
  );
}
