import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  Folder,
  Keyboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Search,
  Settings2,
  Sun,
  UserCircle,
  X,
} from "lucide-react";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenuContent,
  DropdownMenuItem,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  SettingsPanel,
  type SettingsAccountSurface,
  type SettingsScope,
} from "@/features/settings";
import type { ApiClient } from "@/lib/api-client";
import { deleteAuthSession } from "@/lib/api-client";

export type TopBarAccountSurface = SettingsAccountSurface;

export function TopBar({
  accountSurface,
  apiClient,
  reload,
  isNavigationOpen,
  isHistoryOpen,
  onToggleNavigation,
  onToggleHistory,
}: Readonly<{
  accountSurface?: TopBarAccountSurface | undefined;
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
        <CommandSearch />
        <TopBarRight
          isHistoryOpen={isHistoryOpen}
          isDropdownOpen={isDropdownOpen}
          theme={theme}
          onToggleDropdown={() => setIsDropdownOpen((current) => !current)}
          onToggleHistory={onToggleHistory}
          onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
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
          apiClient={apiClient}
          reload={reload}
          onClose={() => setIsSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}

function CommandSearch() {
  const [query, setQuery] = useState("");

  return (
    <form className="top-bar-center" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="top-bar-search">
        <Search size={14} aria-hidden="true" />
        <Input
          aria-label="Command search"
          placeholder="Search documents or commands"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <span className="top-bar-search__shortcut" aria-label="Search is planned">
          {query ? "Planned" : <kbd>⌘K</kbd>}
        </span>
      </label>
    </form>
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
  theme,
  onToggleDropdown,
  onToggleHistory,
  onToggleTheme,
  onOpenSettings,
  onSignOut,
}: Readonly<{
  accountSurface: TopBarAccountSurface | undefined;
  isHistoryOpen: boolean;
  isDropdownOpen: boolean;
  theme: "light" | "dark";
  onToggleDropdown: () => void;
  onToggleHistory: () => void;
  onToggleTheme: () => void;
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
        aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        aria-pressed={theme === "dark"}
        onClick={onToggleTheme}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
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
  accountSurface: TopBarAccountSurface | undefined;
  onOpenSettings: (scope: SettingsScope) => void;
  onSignOut: () => void;
}>) {
  return (
    <DropdownMenuContent className="top-bar-menu">
      <div className="top-bar-menu__account" role="presentation">
        <strong>{accountSurface?.currentMemberDisplayName ?? "Signed in user"}</strong>
        {accountSurface?.userEmail ? <span>{accountSurface.userEmail}</span> : null}
      </div>
      <DropdownMenuItem onClick={() => onOpenSettings("user")}>
        <UserCircle size={14} />
        Account settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onOpenSettings("user")}>
        <Settings2 size={14} />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onOpenSettings("workspace")}>
        <Building2 size={14} />
        Workspace settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onOpenSettings("project")}>
        <Settings2 size={14} />
        Project settings
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <Bell size={14} />
        Notifications
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <Keyboard size={14} />
        Keyboard shortcuts
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut size={14} />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function SettingsDialog({
  accountSurface,
  activeScope,
  onScopeChange,
  apiClient,
  reload,
  onClose,
}: Readonly<{
  accountSurface: TopBarAccountSurface | undefined;
  activeScope: SettingsScope;
  onScopeChange: (scope: SettingsScope) => void;
  apiClient: ApiClient;
  reload: () => void;
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
      <Dialog className="top-bar-settings-dialog" open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogClose aria-label="Close settings" className="ui-button--icon" onClick={onClose}>
              <X size={14} />
            </DialogClose>
          </DialogHeader>
          <Tabs className="top-bar-settings">
            <TabsList aria-label="Settings scope">
              {settingsScopes.map((scope) => (
                <TabsTrigger
                  key={scope}
                  active={scope === activeScope}
                  onClick={() => onScopeChange(scope)}
                >
                  {settingsScopeLabels[scope]}
                </TabsTrigger>
              ))}
            </TabsList>
            <SettingsPanel
              accountSurface={accountSurface}
              apiClient={apiClient}
              reload={reload}
              scope={activeScope}
            />
          </Tabs>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

const settingsScopes: readonly SettingsScope[] = ["user", "workspace", "project"];

const settingsScopeLabels: Readonly<Record<SettingsScope, string>> = {
  user: "User",
  workspace: "Workspace",
  project: "Project",
};
