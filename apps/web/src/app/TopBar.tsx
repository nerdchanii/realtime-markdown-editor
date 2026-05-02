import { useState, type ReactNode } from "react";
import {
  Building2,
  Folder,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Settings2,
  UserCircle,
  X,
} from "lucide-react";

import type { ApiClient } from "@/lib/api-client";
import { deleteAuthSession } from "@/lib/api-client";
import type { ProductAccountSurface } from "./product-workspace-types";

type SettingsScope = "user" | "workspace" | "project";

export function TopBar({
  accountSurface,
  apiClient,
  reload,
  isNavigationOpen,
  isHistoryOpen,
  onToggleNavigation,
  onToggleHistory,
}: Readonly<{
  accountSurface?: ProductAccountSurface;
  apiClient: ApiClient;
  reload: () => void;
  isNavigationOpen: boolean;
  isHistoryOpen: boolean;
  onToggleNavigation: () => void;
  onToggleHistory: () => void;
}>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsScope, setSettingsScope] = useState<SettingsScope>("user");

  const handleSignOut = async () => {
    await deleteAuthSession(apiClient);
    reload();
  };

  return (
    <>
      <header className="top-bar">
        <TopBarLeft
          isNavigationOpen={isNavigationOpen}
          workspaceName={accountSurface?.workspaceName}
          projectName={accountSurface?.projectName}
          onToggleNavigation={onToggleNavigation}
        />
        <div className="top-bar-center" aria-hidden="true" />
        <TopBarRight
          isHistoryOpen={isHistoryOpen}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen((current) => !current)}
          onToggleHistory={onToggleHistory}
          accountSurface={accountSurface}
          onOpenSettings={(scope) => {
            setSettingsScope(scope);
            setIsSettingsOpen(true);
            setIsDropdownOpen(false);
          }}
          onSignOut={handleSignOut}
        />
      </header>
      {isSettingsOpen ? (
        <SettingsDialog
          accountSurface={accountSurface}
          activeScope={settingsScope}
          onScopeChange={setSettingsScope}
          onClose={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}

function TopBarLeft({
  isNavigationOpen,
  workspaceName = "Product workspace",
  projectName = "Project",
  onToggleNavigation,
}: Readonly<{
  isNavigationOpen: boolean;
  workspaceName: string | undefined;
  projectName: string | undefined;
  onToggleNavigation: () => void;
}>) {
  return (
    <div className="top-bar-left">
      <button
        type="button"
        className="top-bar-chip top-bar-chip--icon"
        aria-label={isNavigationOpen ? "Close navigation panel" : "Open navigation panel"}
        aria-pressed={isNavigationOpen}
        onClick={onToggleNavigation}
      >
        {isNavigationOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>
      <TopBarChip icon={<Building2 size={16} />} label={workspaceName} />
      <span className="top-bar-divider" aria-hidden="true" />
      <TopBarChip icon={<Folder size={16} />} label={projectName} />
    </div>
  );
}

function TopBarRight({
  accountSurface,
  isHistoryOpen,
  isDropdownOpen,
  onToggleDropdown,
  onToggleHistory,
  onOpenSettings,
  onSignOut,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  isHistoryOpen: boolean;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onToggleHistory: () => void;
  onOpenSettings: (scope: SettingsScope) => void;
  onSignOut: () => void;
}>) {
  return (
    <div className="top-bar-right">
      <div className="top-bar-avatar-group">
        <button
          type="button"
          className="top-bar-avatar-button"
          aria-label="Open profile menu"
          onClick={onToggleDropdown}
        >
          <span
            className="top-bar-avatar"
            style={{ background: accountSurface?.currentMemberColor }}
            aria-hidden="true"
          />
        </button>
        {isDropdownOpen ? (
          <ProfileMenu
            accountSurface={accountSurface}
            onOpenSettings={onOpenSettings}
            onSignOut={onSignOut}
          />
        ) : null}
      </div>
      <span className="top-bar-divider" aria-hidden="true" />
      <button
        type="button"
        className="top-bar-icon-button"
        aria-label={isHistoryOpen ? "Close history panel" : "Open history panel"}
        aria-pressed={isHistoryOpen}
        onClick={onToggleHistory}
      >
        <PanelRight size={16} />
      </button>
    </div>
  );
}

function ProfileMenu({
  accountSurface,
  onOpenSettings,
  onSignOut,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  onOpenSettings: (scope: SettingsScope) => void;
  onSignOut: () => void;
}>) {
  return (
    <div className="ui-dropdown-content top-bar-menu">
      <div className="top-bar-menu__account" role="presentation">
        <strong>{accountSurface?.currentMemberDisplayName ?? "Signed in user"}</strong>
        {accountSurface?.userEmail ? <span>{accountSurface.userEmail}</span> : null}
      </div>
      <button className="ui-dropdown-item" onClick={() => onOpenSettings("user")}>
        <UserCircle size={14} />
        Account settings
      </button>
      <button className="ui-dropdown-item" onClick={() => onOpenSettings("workspace")}>
        <Building2 size={14} />
        Workspace settings
      </button>
      <button className="ui-dropdown-item" onClick={() => onOpenSettings("project")}>
        <Settings2 size={14} />
        Project settings
      </button>
      <button className="ui-dropdown-item" onClick={onSignOut}>
        <LogOut size={14} />
        Sign out
      </button>
    </div>
  );
}

function SettingsDialog({
  accountSurface,
  activeScope,
  onScopeChange,
  onClose,
}: Readonly<{
  accountSurface: ProductAccountSurface | undefined;
  activeScope: SettingsScope;
  onScopeChange: (scope: SettingsScope) => void;
  onClose: () => void;
}>) {
  return (
    <>
      <button
        type="button"
        className="ui-dialog-backdrop"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div className="ui-dialog top-bar-settings-dialog">
        <div className="ui-dialog-content">
          <header className="ui-dialog-header">
            <h2 className="ui-dialog-title">Settings</h2>
            <button
              className="ui-button ui-button--ghost ui-button--icon ui-dialog-close"
              onClick={onClose}
            >
              <X size={14} />
            </button>
          </header>
          <div className="ui-tabs top-bar-settings">
            <div className="ui-tabs-list" aria-label="Settings scope">
              {settingsScopes.map((scope) => (
                <button
                  key={scope}
                  type="button"
                  className={`ui-tabs-trigger ${scope === activeScope ? "is-active" : ""}`}
                  onClick={() => onScopeChange(scope)}
                >
                  {settingsScopeLabels[scope]}
                </button>
              ))}
            </div>
            <SettingsPanel accountSurface={accountSurface} scope={activeScope} />
          </div>
          <footer className="ui-dialog-footer">
            <button className="ui-button ui-button--secondary" onClick={onClose}>
              Close
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}

function SettingsPanel({
  accountSurface,
  scope,
}: Readonly<{ accountSurface: ProductAccountSurface | undefined; scope: SettingsScope }>) {
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
      <div className="ui-tabs-content top-bar-settings__panel">
        <SettingsField label="Workspace" value={accountSurface?.workspaceName ?? "Workspace"} />
        <SettingsField
          label="Current member"
          value={accountSurface?.currentMemberDisplayName ?? "Member"}
        />
        <p className="top-bar-settings__notice">
          Workspace member administration remains disabled until owner-backed membership mutations
          are available.
        </p>
      </div>
    );
  }

  return (
    <div className="ui-tabs-content top-bar-settings__panel">
      <SettingsField label="Project" value={accountSurface?.projectName ?? "Project"} />
      <p className="top-bar-settings__notice">
        Project settings are read-only while the project management API is limited to core workspace
        navigation.
      </p>
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

function TopBarChip({ icon, label }: Readonly<{ icon: ReactNode; label: string }>) {
  return (
    <div className="top-bar-chip" aria-label={label}>
      <span className="top-bar-chip__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

const settingsScopes: readonly SettingsScope[] = ["user", "workspace", "project"];

const settingsScopeLabels: Readonly<Record<SettingsScope, string>> = {
  user: "User",
  workspace: "Workspace",
  project: "Project",
};
