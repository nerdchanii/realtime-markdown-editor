import { useState, type FormEvent } from "react";

import type { ApiClient } from "@/lib/api-client";
import { createProject, updateProject, updateWorkspace } from "@/lib/api-client";

import type { ProductAccountSurface } from "./product-workspace-types";

export type SettingsScope = "user" | "workspace" | "project";

export function SettingsPanel({
  accountSurface,
  apiClient,
  reload,
  scope,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
  scope: SettingsScope;
}>) {
  if (scope === "user") {
    return (
      <div className="ui-tabs-content top-bar-settings__panel">
        <SettingsField label="Name" value={accountSurface?.userName ?? "Signed in user"} />
        <SettingsField label="Email" value={accountSurface?.userEmail ?? "Not available"} />
        <SettingsField
          label="Workspace display name"
          value={accountSurface?.currentMemberDisplayName ?? "Member"}
        />
        <p className="top-bar-settings__notice">
          Profile editing and account deactivation need the account management API contract before
          they can be enabled.
        </p>
      </div>
    );
  }

  if (scope === "workspace") {
    return (
      <WorkspaceSettingsPanel
        key={accountSurface?.workspaceId ?? "workspace-settings"}
        accountSurface={accountSurface}
        apiClient={apiClient}
        reload={reload}
      />
    );
  }

  return (
    <ProjectSettingsPanel
      key={accountSurface?.projectId ?? "project-settings"}
      accountSurface={accountSurface}
      apiClient={apiClient}
      reload={reload}
    />
  );
}

function WorkspaceSettingsPanel({
  accountSurface,
  apiClient,
  reload,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
}>) {
  const [workspaceName, setWorkspaceName] = useState(accountSurface?.workspaceName ?? "");
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState("");

  const handleRenameWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!accountSurface?.workspaceId || !name) return;
    await updateWorkspace(apiClient, accountSurface.workspaceId, { name });
    setStatus("Workspace saved.");
    reload();
  };

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!accountSurface?.workspaceId || !name) return;
    await createProject(apiClient, accountSurface.workspaceId, { name });
    setProjectName("");
    setStatus("Project created.");
    reload();
  };

  return (
    <div className="ui-tabs-content top-bar-settings__panel">
      <form className="top-bar-settings__form" onSubmit={handleRenameWorkspace}>
        <EditableSettingsField
          label="Workspace name"
          value={workspaceName}
          onChange={setWorkspaceName}
        />
        <button className="ui-button ui-button--secondary" type="submit">
          Save workspace
        </button>
      </form>
      <form className="top-bar-settings__form" onSubmit={handleCreateProject}>
        <EditableSettingsField label="New project" value={projectName} onChange={setProjectName} />
        <button className="ui-button ui-button--secondary" type="submit">
          Create project
        </button>
      </form>
      <SettingsField
        label="Current member"
        value={accountSurface?.currentMemberDisplayName ?? "Member"}
      />
      {status ? <p className="top-bar-settings__status">{status}</p> : null}
    </div>
  );
}

function ProjectSettingsPanel({
  accountSurface,
  apiClient,
  reload,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
}>) {
  const [projectName, setProjectName] = useState(accountSurface?.projectName ?? "");
  const [status, setStatus] = useState("");

  const handleRenameProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!accountSurface?.projectId || !name) return;
    await updateProject(apiClient, accountSurface.projectId, { name });
    setStatus("Project saved.");
    reload();
  };

  return (
    <div className="ui-tabs-content top-bar-settings__panel">
      <form className="top-bar-settings__form" onSubmit={handleRenameProject}>
        <EditableSettingsField label="Project name" value={projectName} onChange={setProjectName} />
        <button
          className="ui-button ui-button--secondary"
          disabled={!accountSurface?.projectId}
          type="submit"
        >
          Save project
        </button>
      </form>
      {status ? <p className="top-bar-settings__status">{status}</p> : null}
    </div>
  );
}

function SettingsField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="top-bar-settings__field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EditableSettingsField({
  label,
  value,
  onChange,
}: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return (
    <label className="top-bar-settings__field">
      <span>{label}</span>
      <input
        className="top-bar-settings__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
