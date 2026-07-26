"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleIcon, LockIcon, MailIcon } from "@/components/shared/icons";
import { authContent } from "@/content/acessos";
import { isValidEmail, persistDemoSession } from "@/lib/access-control";

export function LoginForm() {
  const [email, setEmail] = useState("lenon@ateliux.com.br");
  const [password, setPassword] = useState("financeiro2026");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function enter(emailValue: string) {
    persistDemoSession(emailValue);
    window.location.assign("/visao-geral");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email) || password.length < 8) {
      setError(authContent.login.invalid);
      return;
    }
    setError("");
    enter(email);
  }

  return (
    <div className="auth-card">
      <header className="auth-card-heading">
        <span>{authContent.login.eyebrow}</span>
        <h2>{authContent.login.title}</h2>
        <p>{authContent.login.description}</p>
      </header>

      <button className="auth-google-button" type="button" onClick={() => enter(email)}>
        <GoogleIcon />
        {authContent.login.google}
      </button>

      <div className="auth-divider"><span>{authContent.login.divider}</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>{authContent.login.email}</span>
          <div className="auth-input-wrap">
            <MailIcon />
            <input
              type="email"
              value={email}
              placeholder={authContent.login.emailPlaceholder}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
        </label>

        <label>
          <span>{authContent.login.password}</span>
          <div className="auth-input-wrap">
            <LockIcon />
            <input
              type="password"
              value={password}
              placeholder={authContent.login.passwordPlaceholder}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
        </label>

        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>{authContent.login.remember}</span>
          </label>
          <Link href="/recuperar-senha">{authContent.login.forgot}</Link>
        </div>

        {error ? <p className="auth-form-error">{error}</p> : null}

        <button className="auth-submit-button" type="submit">
          {authContent.login.submit}
        </button>
      </form>

      <p className="auth-switch-copy">
        {authContent.login.noAccount} <Link href="/registro">{authContent.login.register}</Link>
      </p>
      <small className="auth-demo-note">{authContent.login.demoNote}</small>
    </div>
  );
}
