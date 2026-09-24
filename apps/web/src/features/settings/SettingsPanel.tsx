import { useEffect, useState, type FormEvent } from "react";

import type {
  ProjectId,
  WorkspaceId,
  WorkspaceMemberDto,
  WorkspaceMembershipId,
} from "@rme/contracts";

import { Button, Input, TabsContent } from "@/components/ui";
import type { ApiClient } from "@/lib/api-client";
import {
  createWorkspaceMember,
  createProject,
  deleteProject,
  deleteWorkspace,
  deleteWorkspaceMember,
  fetchWorkspaceMembers,
  updateAccountProfile,
  updateWorkspaceMember,
  updateProject,
  updateWorkspace,
} from "@/lib/api-client";

export type SettingsScope = "user" | "workspace" | "project";

export type SettingsAccountSurface = Readonly<{
  currentMemberColor?: string | undefined;
  currentMemberDisplayName?: string | undefined;
  currentMemberId?: WorkspaceMembershipId | null | undefined;
  projectId?: ProjectId | null | undefined;
  projectName?: string | undefined;
  userEmail?: string | undefined;
  userName?: string | undefined;
  workspaceId?: WorkspaceId | undefined;
  workspaceName?: string | undefined;
}>;

export function SettingsPanel({
  accountSurface,
  apiClient,
  reload,
  scope,
}: Readonly<{
  accountSurface: SettingsAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
  scope: SettingsScope;
}>) {
  if (scope === "user") {
    return (
      <UserSettingsPanel
        key={accountSurface?.userEmail ?? "user-settings"}
        accountSurface={accountSurface}
        apiClient={apiClient}
        reload={reload}
      />
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

function UserSettingsPanel({
  accountSurface,
  apiClient,
  reload,
}: Readonly<{
  accountSurface: SettingsAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
}>) {
  const [userName, setUserName] = useState(accountSurface?.userName ?? "");
  const [status, setStatus] = useState("");

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = userName.trim();
    if (!name) return;
    await updateAccountProfile(apiClient, { name });
    setStatus("Account saved.");
    reload();
  };

  return (
    <TabsContent className="top-bar-settings__panel">
      <form className="top-bar-settings__form" onSubmit={handleUpdateProfile}>
        <EditableSettingsField label="Name" value={userName} onChange={setUserName} />
        <Button variant="secondary" type="submit">
          Save account
        </Button>
      </form>
      <SettingsField label="Email" value={accountSurface?.userEmail ?? "Not available"} />
      <SettingsField
        label="Workspace display name"
        value={accountSurface?.currentMemberDisplayName ?? "Member"}
      />
      <p className="top-bar-settings__notice">
        Account deactivation follows the retention policy and still needs a dedicated API mutation.
      </p>
      {status ? <p className="top-bar-settings__status">{status}</p> : null}
    </TabsContent>
  );
}

function WorkspaceSettingsPanel({
  accountSurface,
  apiClient,
  reload,
}: Readonly<{
  accountSurface: SettingsAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
}>) {
  const [workspaceName, setWorkspaceName] = useState(accountSurface?.workspaceName ?? "");
  const [projectName, setProjectName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState<readonly WorkspaceMemberDto[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let isActive = true;
    if (!accountSurface?.workspaceId) return undefined;
    void fetchWorkspaceMembers(apiClient, accountSurface.workspaceId)
      .then((response) => {
        if (isActive) setMembers(response.members);
      })
      .catch(() => {
        if (isActive) setStatus("Members could not be loaded.");
      });

    return () => {
      isActive = false;
    };
  }, [accountSurface?.workspaceId, apiClient]);

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

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = memberEmail.trim();
    if (!accountSurface?.workspaceId || !email) return;
    const response = await createWorkspaceMember(apiClient, accountSurface.workspaceId, {
      email,
      role: "editor",
    });
    setMembers((current) => upsertMember(current, response.member));
    setMemberEmail("");
    setStatus("Member added.");
    reload();
  };

  const handleUpdateMemberRole = async (
    memberId: WorkspaceMembershipId,
    role: WorkspaceMemberDto["role"],
  ) => {
    if (!accountSurface?.workspaceId) return;
    const response = await updateWorkspaceMember(apiClient, accountSurface.workspaceId, memberId, {
      role,
    });
    setMembers((current) => upsertMember(current, response.member));
    setStatus("Member role saved.");
    reload();
  };

  const handleRemoveMember = async (memberId: WorkspaceMembershipId) => {
    if (!accountSurface?.workspaceId) return;
    await deleteWorkspaceMember(apiClient, accountSurface.workspaceId, memberId);
    setMembers((current) => current.filter((member) => member.id !== memberId));
    setStatus("Member removed.");
    reload();
  };

  const handleArchiveWorkspace = async () => {
    if (!accountSurface?.workspaceId) return;
    if (!confirmDestructiveAction(`Archive workspace "${accountSurface.workspaceName}"?`)) return;
    await deleteWorkspace(apiClient, accountSurface.workspaceId);
    setStatus("Workspace archived.");
    reload();
  };

  return (
    <TabsContent className="top-bar-settings__panel">
      <form className="top-bar-settings__form" onSubmit={handleRenameWorkspace}>
        <EditableSettingsField
          label="Workspace name"
          value={workspaceName}
          onChange={setWorkspaceName}
        />
        <Button variant="secondary" type="submit">
          Save workspace
        </Button>
      </form>
      <form className="top-bar-settings__form" onSubmit={handleCreateProject}>
        <EditableSettingsField label="New project" value={projectName} onChange={setProjectName} />
        <Button variant="secondary" type="submit">
          Create project
        </Button>
      </form>
      <SettingsField
        label="Current member"
        value={accountSurface?.currentMemberDisplayName ?? "Member"}
      />
      <form className="top-bar-settings__form" onSubmit={handleAddMember}>
        <EditableSettingsField
          label="New member email"
          value={memberEmail}
          onChange={setMemberEmail}
        />
        <Button variant="secondary" type="submit">
          Add member
        </Button>
      </form>
      <div className="top-bar-settings__members" aria-label="Workspace members">
        {members.map((member) => (
          <div className="top-bar-settings__member" key={member.id}>
            <span className="top-bar-settings__member-color" style={{ background: member.color }} />
            <strong>{member.displayName}</strong>
            <select
              aria-label={`Role for ${member.displayName}`}
              className="top-bar-settings__select"
              value={member.role === "owner" ? "owner" : "editor"}
              onChange={(event) =>
                void handleUpdateMemberRole(
                  member.id,
                  event.currentTarget.value === "owner" ? "owner" : "editor",
                )
              }
            >
              <option value="owner">Owner</option>
              <option value="editor">Member</option>
            </select>
            <Button
              variant="secondary"
              disabled={member.id === accountSurface?.currentMemberId}
              type="button"
              onClick={() => void handleRemoveMember(member.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button variant="secondary" type="button" onClick={handleArchiveWorkspace}>
        Archive workspace
      </Button>
      {status ? <p className="top-bar-settings__status">{status}</p> : null}
    </TabsContent>
  );
}

function ProjectSettingsPanel({
  accountSurface,
  apiClient,
  reload,
}: Readonly<{
  accountSurface: SettingsAccountSurface | undefined;
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

  const handleArchiveProject = async () => {
    if (!accountSurface?.projectId) return;
    if (!confirmDestructiveAction(`Archive project "${accountSurface.projectName}"?`)) return;
    await deleteProject(apiClient, accountSurface.projectId);
    setStatus("Project archived.");
    reload();
  };

  return (
    <TabsContent className="top-bar-settings__panel">
      <form className="top-bar-settings__form" onSubmit={handleRenameProject}>
        <EditableSettingsField label="Project name" value={projectName} onChange={setProjectName} />
        <Button variant="secondary" disabled={!accountSurface?.projectId} type="submit">
          Save project
        </Button>
      </form>
      <Button
        variant="secondary"
        disabled={!accountSurface?.projectId}
        type="button"
        onClick={handleArchiveProject}
      >
        Archive project
      </Button>
      {status ? <p className="top-bar-settings__status">{status}</p> : null}
    </TabsContent>
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
      <Input
        className="top-bar-settings__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function upsertMember(
  members: readonly WorkspaceMemberDto[],
  updatedMember: WorkspaceMemberDto,
): readonly WorkspaceMemberDto[] {
  const existing = members.find((member) => member.id === updatedMember.id);
  if (!existing) return [...members, updatedMember];
  return members.map((member) => (member.id === updatedMember.id ? updatedMember : member));
}

function confirmDestructiveAction(message: string): boolean {
  if (typeof globalThis.confirm !== "function") return true;
  return globalThis.confirm(message);
}
