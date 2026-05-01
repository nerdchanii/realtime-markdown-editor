import { useState, type ReactNode } from "react";
import {
  Building2,
  Settings2,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  X,
} from "lucide-react";

import type { ApiClient } from "@/lib/api-client";
import { deleteAuthSession } from "@/lib/api-client";

export function TopBar({
  apiClient,
  reload,
  isNavigationOpen,
  isHistoryOpen,
  onToggleNavigation,
  onToggleHistory,
}: Readonly<{
  apiClient: ApiClient;
  reload: () => void;
  isNavigationOpen: boolean;
  isHistoryOpen: boolean;
  onToggleNavigation: () => void;
  onToggleHistory: () => void;
}>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await deleteAuthSession(apiClient);
    reload();
  };

  return (
    <>
      <header className="top-bar">
        <TopBarLeft isNavigationOpen={isNavigationOpen} onToggleNavigation={onToggleNavigation} />
        <div className="top-bar-center" aria-hidden="true" />
        <TopBarRight
          isHistoryOpen={isHistoryOpen}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen((current) => !current)}
          onToggleHistory={onToggleHistory}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsDropdownOpen(false);
          }}
          onSignOut={handleSignOut}
        />
      </header>
      {isSettingsOpen ? <SettingsDialog onClose={() => setIsSettingsOpen(false)} /> : null}
    </>
  );
}

function TopBarLeft({
  isNavigationOpen,
  onToggleNavigation,
}: Readonly<{
  isNavigationOpen: boolean;
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
      <TopBarChip icon={<Building2 size={16} />} label="Acme Engineering" />
      <span className="top-bar-divider" aria-hidden="true" />
      <TopBarChip icon={<Folder size={16} />} label="Core Engine" />
    </div>
  );
}

function TopBarRight({
  isHistoryOpen,
  isDropdownOpen,
  onToggleDropdown,
  onToggleHistory,
  onOpenSettings,
  onSignOut,
}: Readonly<{
  isHistoryOpen: boolean;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onToggleHistory: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}>) {
  return (
    <div className="top-bar-right">
      <button
        type="button"
        className="top-bar-icon-button"
        aria-label="Open settings"
        onClick={onOpenSettings}
      >
        <Settings2 size={16} />
      </button>
      <div className="top-bar-avatar-group">
        <button type="button" className="top-bar-avatar-button" onClick={onToggleDropdown}>
          <span className="top-bar-avatar" aria-hidden="true" />
        </button>
        {isDropdownOpen ? (
          <ProfileMenu onOpenSettings={onOpenSettings} onSignOut={onSignOut} />
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
  onOpenSettings,
  onSignOut,
}: Readonly<{ onOpenSettings: () => void; onSignOut: () => void }>) {
  return (
    <div className="ui-dropdown-content top-bar-menu">
      <button className="ui-dropdown-item" onClick={onOpenSettings}>
        Settings
      </button>
      <button className="ui-dropdown-item" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

function SettingsDialog({ onClose }: Readonly<{ onClose: () => void }>) {
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
          <div className="ui-tabs-content" style={{ marginTop: "16px", minHeight: "100px" }}>
            <p>Settings are not available yet.</p>
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
