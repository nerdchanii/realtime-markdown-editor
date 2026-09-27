import type { ReactNode } from "react";

import "./shell.css";

export type Theme = "dark" | "light";

interface ShellProps {
  explorer: ReactNode;
  explorerOpen: boolean;
  onToggleExplorer: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function Shell({
  explorer,
  explorerOpen,
  onToggleExplorer,
  theme,
  onToggleTheme,
  children,
}: ShellProps) {
  return (
    <div className="shell">
      <header className="shell__topbar">
        <button
          type="button"
          className="shell__action"
          onClick={onToggleExplorer}
          aria-pressed={explorerOpen}
          title="탐색기 열고 닫기 (Ctrl/⌘ + \)"
        >
          탐색기
        </button>
        <div className="shell__workspace">
          로컬
          <span className="shell__workspace-note">이 브라우저에만 저장됩니다</span>
        </div>
        <div className="shell__spacer" />
        <button type="button" className="shell__action" onClick={onToggleTheme}>
          {theme === "dark" ? "라이트 테마" : "다크 테마"}
        </button>
      </header>
      <div className={explorerOpen ? "shell__body" : "shell__body shell__body--explorer-closed"}>
        <nav className="shell__explorer" aria-label="문서 탐색기" aria-hidden={!explorerOpen}>
          {explorer}
        </nav>
        <main className="shell__main">{children}</main>
      </div>
    </div>
  );
}
