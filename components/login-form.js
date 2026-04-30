"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers["content-type"]) {
    headers["content-type"] = "application/json";
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await request("/api/session/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

      <section className="auth-card">
        <div className="eyebrow">Home Rental Platform</div>
        <h1>Admin command center</h1>
        <p className="auth-copy">
          Sign in with an admin phone number and password. This dashboard
          proxies requests to the backend running on the VM, so the browser
          never needs direct access to port <code>5001</code>.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Admin phone</span>
            <input
              autoComplete="username"
              name="phone"
              placeholder="0123456789"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="seed-note">
          <strong>Seed login from backend migration:</strong> phone{" "}
          <code>0123456789</code> and password <code>Test@123</code> if your
          database still uses the default admin user.
        </div>
      </section>
    </main>
  );
}

