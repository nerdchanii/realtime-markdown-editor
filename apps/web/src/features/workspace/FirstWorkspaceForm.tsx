import { useState, type FormEvent } from "react";

import { Button, Input } from "@/components/ui";
import { createWorkspace, type ApiClient } from "@/lib/api-client";

export function FirstWorkspaceForm({
  apiClient,
  reload,
}: Readonly<{
  apiClient: ApiClient;
  reload: () => void;
}>) {
  const [workspaceName, setWorkspaceName] = useState("Team workspace");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;

    setIsCreating(true);
    setErrorMessage(null);
    try {
      await createWorkspace(apiClient, { name });
      reload();
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
      <label className="auth-field workspace-onboarding__field" htmlFor="first-workspace-name">
        <span className="auth-field__label">Workspace name</span>
        <Input
          id="first-workspace-name"
          className="auth-field__input"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          disabled={isCreating}
        />
      </label>
      <Button
        type="submit"
        className="workspace-onboarding__submit"
        variant="primary"
        disabled={isCreating || !workspaceName.trim()}
      >
        {isCreating ? "Creating workspace..." : "Create workspace"}
      </Button>
      {errorMessage ? (
        <p className="auth-card__error workspace-onboarding__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
