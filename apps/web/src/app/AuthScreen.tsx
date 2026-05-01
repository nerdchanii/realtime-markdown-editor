import { useState, type FormEvent } from "react";

import type { ApiClient } from "@/lib/api-client";
import { createAuthSession } from "@/lib/api-client";

export function AuthScreen({
  apiClient,
  reload,
}: Readonly<{ apiClient: ApiClient; reload: () => void }>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginWithCredentials = async (nextEmail: string, nextPassword: string) => {
    if (!nextEmail || !nextPassword) return;
    setEmail(nextEmail);
    setPassword(nextPassword);
    setIsLoading(true);
    try {
      await createAuthSession(apiClient, { email: nextEmail, password: nextPassword });
      reload();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginWithCredentials(email, password);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <AuthCardBody
          email={email}
          isLoading={isLoading}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={handleLogin}
          onQuickLogin={loginWithCredentials}
        />
      </section>
    </main>
  );
}

function AuthField({
  id,
  label,
  type = "email",
  value,
  onChange,
  disabled,
}: Readonly<{
  id: string;
  label: string;
  type?: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}>) {
  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="ui-input auth-field__input"
        placeholder={type === "password" ? "••••••••" : "alice@example.test"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function AuthCardBody({
  email,
  isLoading,
  password,
  onEmailChange,
  onLogin,
  onQuickLogin,
  onPasswordChange,
}: Readonly<{
  email: string;
  isLoading: boolean;
  password: string;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
}>) {
  return (
    <>
      <h2 className="auth-card__title">Local session bootstrap</h2>
      <p className="auth-card__copy">
        Development account sign in. Use this only for local reviewer flows.
      </p>
      <AuthForm
        email={email}
        isLoading={isLoading}
        onEmailChange={onEmailChange}
        onLogin={onLogin}
        onQuickLogin={onQuickLogin}
        onPasswordChange={onPasswordChange}
        password={password}
      />
    </>
  );
}

function AuthForm({
  email,
  isLoading,
  onEmailChange,
  onLogin,
  onQuickLogin,
  onPasswordChange,
  password,
}: Readonly<{
  email: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
  password: string;
}>) {
  return (
    <form className="auth-card__form" onSubmit={onLogin}>
      <AuthField
        id="auth-email"
        label="Email address"
        value={email}
        onChange={onEmailChange}
        disabled={isLoading}
      />
      <AuthField
        id="auth-password"
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        disabled={isLoading}
      />
      <AuthActions
        isLoading={isLoading}
        onEmailChange={onEmailChange}
        onQuickLogin={onQuickLogin}
        onPasswordChange={onPasswordChange}
      />
    </form>
  );
}

function AuthActions({
  isLoading,
  onEmailChange,
  onQuickLogin,
  onPasswordChange,
}: Readonly<{
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
}>) {
  return (
    <>
      <button
        type="submit"
        className="ui-button ui-button--primary auth-card__submit"
        disabled={isLoading}
      >
        {isLoading ? "Starting session..." : "Start local session"}
      </button>
      {isDevQuickLoginEnabled ? (
        <div className="auth-dev-accounts" aria-label="Development accounts">
          {devAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              className="ui-button ui-button--ghost ui-button--sm auth-card__secondary"
              disabled={isLoading}
              onClick={() => {
                onEmailChange(account.email);
                onPasswordChange(account.password);
                void onQuickLogin(account.email, account.password);
              }}
            >
              Continue as {account.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

const isDevQuickLoginEnabled = import.meta.env.DEV;

const devAccounts = [
  { label: "Alice", email: "alice@example.test", password: "password" },
  { label: "Bob", email: "bob@example.test", password: "password" },
] as const;
