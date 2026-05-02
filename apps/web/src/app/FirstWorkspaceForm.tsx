import { useState, type FormEvent } from "react";

import { createWorkspace } from "@/lib/api-client";

import type { ProductWorkspaceState } from "./product-workspace-types";

export function FirstWorkspaceForm({
  state,
}: Readonly<{ state: Extract<ProductWorkspaceState, { status: "no-workspace" }> }>) {
  const [workspaceName, setWorkspaceName] = useState("Product workspace");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;

    setIsCreating(true);
    setErrorMessage(null);
    try {
      await createWorkspace(state.apiClient, { name });
      state.reload();
    } catch (error) {
      console.error(error);
      setErrorMessage("Workspace could not be created. Try again.");
      setIsCreating(false);
    }
  };

  return (
    <form className="workspace-onboarding" onSubmit={handleSubmit}>
      <h2 className="workspace-onboarding__title">Create your first workspace</h2>
      <p className="workspace-onboarding__copy">
        Workspaces hold projects, folders, documents, and collaboration membership.
      </p>
      <label className="auth-field workspace-onboarding__field">
        <span className="auth-field__label">Workspace name</span>
        <input
          className="ui-input auth-field__input"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          disabled={isCreating}
        />
      </label>
      <button
        type="submit"
        className="ui-button ui-button--primary workspace-onboarding__submit"
        disabled={isCreating || !workspaceName.trim()}
      >
        {isCreating ? "Creating workspace..." : "Create workspace"}
      </button>
      {errorMessage ? (
        <p className="auth-card__error workspace-onboarding__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
