import { useEffect, useState } from "react";
import { API } from "./config.js";

export default function AuthScreen({ onAuthed, onBack }) {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onBack]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const detail = Array.isArray(err.detail)
            ? "Username needs 3+ characters and password 6+ characters"
            : err.detail;
          throw new Error(detail || "Registration failed");
        }
      }
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        body: new URLSearchParams({ username: name, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      onAuthed(data.access_token, name.trim().toLowerCase());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onBack();
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          className="auth-modal-close"
          type="button"
          onClick={onBack}
          aria-label="Close account dialog"
        >
          &times;
        </button>
        <p className="auth-modal-kicker">Welcome to SajGhar</p>
        <h2 className="auth-modal-title" id="auth-modal-title">
          {mode === "login" ? (
            <>Welcome back.</>
          ) : (
            <>Create an account.</>
          )}
        </h2>
        <p className="auth-modal-copy">
          {mode === "login"
            ? "Sign in to step into your personal wardrobe."
            : "Create your account to start styling your wardrobe."}
        </p>

        <form className="auth-modal-form" onSubmit={submit}>
          <input
            className="auth-modal-field"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            className="auth-modal-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          <button className="auth-modal-submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {error && <p className="auth-modal-error">{error}</p>}

        <p className="auth-modal-switch">
          {mode === "login"
            ? "New to SajGhar? "
            : "Already have an account? "}
          <button
            type="button"
            className="auth-modal-link"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </section>
    </div>
  );
}