import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useAuthStore } from "../../lib/state/authStore";

export const LoginPage = (): ReactElement => {
  const [email, setEmail] = useState("admin@zorya.app");
  const [password, setPassword] = useState("Password@123");
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <main className="auth-shell">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <section className="auth-card">
        <h1>Finance Command Desk</h1>
        <p>Use seeded credentials to explore role-based behavior.</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </form>
        <div className="auth-hint">
          <p>viewer@zorya.app / Password@123</p>
          <p>analyst@zorya.app / Password@123</p>
          <p>admin@zorya.app / Password@123</p>
        </div>
      </section>
    </main>
  );
};
