import { useState, type FormEvent } from "react";

import type { ApiClient } from "@/lib/api-client";
import { createAccount, createAuthSession } from "@/lib/api-client";

type AuthMode = "sign-in" | "create-account";

export function AuthScreen({
  apiClient,
  reload,
}: Readonly<{ apiClient: ApiClient; reload: () => void }>) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginWithCredentials = async (nextEmail: string, nextPassword: string) => {
    if (!nextEmail || !nextPassword) return;
    setErrorMessage(null);
    setEmail(nextEmail);
    setPassword(nextPassword);
    setIsLoading(true);
    try {
      await createAuthSession(apiClient, { email: nextEmail, password: nextPassword });
      reload();
    } catch (error) {
      console.error(error);
      setErrorMessage("The email or password did not match an active product account.");
      setIsLoading(false);
    }
  };

  const createAccountWithCredentials = async (
    nextEmail: string,
    nextName: string,
    nextPassword: string,
  ) => {
    if (!nextEmail || !nextName || !nextPassword) return;
    setErrorMessage(null);
    setEmail(nextEmail);
    setName(nextName);
    setPassword(nextPassword);
    setIsLoading(true);
    try {
      await createAccount(apiClient, {
        email: nextEmail,
        name: nextName,
        password: nextPassword,
      });
      await createAuthSession(apiClient, { email: nextEmail, password: nextPassword });
      reload();
    } catch (error) {
      console.error(error);
      setErrorMessage("Account could not be created with these details.");
      setIsLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginWithCredentials(email, password);
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createAccountWithCredentials(email, name, password);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <AuthCardBody
          email={email}
          errorMessage={errorMessage}
          isLoading={isLoading}
          mode={mode}
          name={name}
          password={password}
          onEmailChange={setEmail}
          onCreateAccount={handleCreateAccount}
          onPasswordChange={setPassword}
          onNameChange={setName}
          onLogin={handleLogin}
          onQuickLogin={loginWithCredentials}
          onSwitchMode={switchMode}
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
  type?: "email" | "password" | "text";
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
        placeholder={placeholderForAuthField(type)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function AuthCardBody({
  email,
  errorMessage,
  isLoading,
  mode,
  name,
  password,
  onCreateAccount,
  onEmailChange,
  onLogin,
  onNameChange,
  onQuickLogin,
  onPasswordChange,
  onSwitchMode,
}: Readonly<{
  email: string;
  errorMessage: string | null;
  isLoading: boolean;
  mode: AuthMode;
  name: string;
  password: string;
  onCreateAccount: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNameChange: (value: string) => void;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
}>) {
  const isCreateMode = mode === "create-account";
  return (
    <>
      <h2 className="auth-card__title">
        {isCreateMode ? "Create product account" : "Product sign in"}
      </h2>
      <p className="auth-card__copy">
        {isCreateMode
          ? "Create a local product account, then set up or join a workspace."
          : "Sign in with a product account to open your workspace, documents, and collaboration session."}
      </p>
      <AuthForm
        email={email}
        errorMessage={errorMessage}
        isLoading={isLoading}
        mode={mode}
        name={name}
        onCreateAccount={onCreateAccount}
        onEmailChange={onEmailChange}
        onLogin={onLogin}
        onNameChange={onNameChange}
        onQuickLogin={onQuickLogin}
        onPasswordChange={onPasswordChange}
        onSwitchMode={onSwitchMode}
        password={password}
      />
    </>
  );
}

function AuthForm({
  email,
  errorMessage,
  isLoading,
  mode,
  name,
  onCreateAccount,
  onEmailChange,
  onLogin,
  onNameChange,
  onQuickLogin,
  onPasswordChange,
  onSwitchMode,
  password,
}: Readonly<{
  email: string;
  errorMessage: string | null;
  isLoading: boolean;
  mode: AuthMode;
  name: string;
  onCreateAccount: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNameChange: (value: string) => void;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
  password: string;
}>) {
  const isCreateMode = mode === "create-account";
  return (
    <form className="auth-card__form" onSubmit={isCreateMode ? onCreateAccount : onLogin}>
      <AuthField
        id="auth-email"
        label="Email address"
        value={email}
        onChange={onEmailChange}
        disabled={isLoading}
      />
      {isCreateMode ? (
        <AuthField
          id="auth-name"
          label="Name"
          type="text"
          value={name}
          onChange={onNameChange}
          disabled={isLoading}
        />
      ) : null}
      <AuthField
        id="auth-password"
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        disabled={isLoading}
      />
      <AuthActions
        errorMessage={errorMessage}
        isLoading={isLoading}
        mode={mode}
        onEmailChange={onEmailChange}
        onQuickLogin={onQuickLogin}
        onPasswordChange={onPasswordChange}
        onSwitchMode={onSwitchMode}
      />
    </form>
  );
}

function AuthActions({
  errorMessage,
  isLoading,
  mode,
  onEmailChange,
  onQuickLogin,
  onPasswordChange,
  onSwitchMode,
}: Readonly<{
  errorMessage: string | null;
  isLoading: boolean;
  mode: AuthMode;
  onEmailChange: (value: string) => void;
  onQuickLogin: (email: string, password: string) => Promise<void>;
  onPasswordChange: (value: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
}>) {
  const isCreateMode = mode === "create-account";
  return (
    <>
      <button
        type="submit"
        className="ui-button ui-button--primary auth-card__submit"
        disabled={isLoading}
      >
        {isLoading
          ? isCreateMode
            ? "Creating account..."
            : "Signing in..."
          : isCreateMode
            ? "Create account"
            : "Sign in"}
      </button>
      {errorMessage ? (
        <p className="auth-card__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="button"
        className="ui-button ui-button--ghost ui-button--sm auth-card__secondary"
        disabled={isLoading}
        onClick={() => onSwitchMode(isCreateMode ? "sign-in" : "create-account")}
      >
        {isCreateMode ? "Sign in instead" : "Create an account"}
      </button>
      {isDevQuickLoginEnabled ? (
        <div className="auth-dev-accounts" aria-label="Development accounts">
          <p className="auth-dev-accounts__label">Local seed accounts</p>
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

function placeholderForAuthField(type: "email" | "password" | "text") {
  if (type === "password") return "••••••••";
  if (type === "text") return "Alice";
  return "alice@example.test";
}

const isDevQuickLoginEnabled = import.meta.env.DEV;

const devAccounts = [
  { label: "Alice", email: "alice@example.test", password: "password" },
  { label: "Bob", email: "bob@example.test", password: "password" },
] as const;
