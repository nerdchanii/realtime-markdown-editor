---
title: DESIGN.md
version: 0.1.0
product: Realtime collaborative Markdown editor
design_intent: Dense technical writing workspace for teams
colors:
  background: "#f6f8fa"
  surface: "#ffffff"
  elevated_surface: "#ffffff"
  text_primary: "#1f2328"
  text_secondary: "#57606a"
  text_muted: "#6e7781"
  border: "#d0d7de"
  border_strong: "#8c959f"
  accent: "#0969da"
  accent_muted: "#ddf4ff"
  success: "#1a7f37"
  warning: "#9a6700"
  danger: "#cf222e"
  info: "#0969da"
  selection: "#b6e3ff"
  presence:
    - "#0969da"
    - "#1a7f37"
    - "#bf8700"
    - "#8250df"
    - "#cf222e"
    - "#0a7ea4"
typography:
  ui_family: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  editor_family: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
  preview_family: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  body_size: "14px"
  editor_size: "14px"
  metadata_size: "12px"
  line_height: 1.55
  heading_weight: 650
radii:
  small: "4px"
  medium: "6px"
  large: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
layout:
  shell: "full-height three-panel workspace"
  sidebar_width: "260px"
  inspector_width: "320px"
  toolbar_height: "52px"
components:
  toolbar: "compact, icon-led, with segmented mode controls"
  editor: "monospace Markdown source with active-line and presence overlays"
  preview: "rendered Markdown pane with document typography"
  inspector: "tabbed comments, tasks, activity, and document context"
  status_badge: "compact semantic badge, never decorative"
motion:
  duration_fast: "120ms"
  duration_normal: "180ms"
focus:
  ring: "2px solid #0969da"
breakpoints:
  desktop: "1200px"
  tablet: "768px"
  mobile: "480px"
---

# DESIGN.md

## Overview

This product should feel like a serious writing and review tool that software teams use every day. The first screen is the actual editor workspace, not a landing page or dashboard. The UI should be calm, dense, readable, and optimized for repeated collaboration sessions.

## Product Principles

- Editor first: navigation and inspector surfaces support the document.
- Collaboration is visible but transient: presence, selection, and sync state must not become document content.
- Markdown stays portable: rich editing must not hide or break source/export behavior.
- Review context stays compact: history, comments, tasks, and status signals live near the document without overpowering the editor.
- Offline state is explicit: reconnecting and pending local edits should be visible, but must not look like a red danger state unless data loss is likely.
- Workspace context remains present: the product must not feel like a single-document demo.

## Visual Direction

Use restrained neutral surfaces, clear borders, dense spacing, and strong content hierarchy. Avoid decorative gradients, overly rounded cards, beige note-app styling, nested cards, and marketing-page composition. Cards are only for repeated items or modals.

## Color System

Primary content uses near-black text on white or light gray surfaces. Accent blue is reserved for focus, selected navigation, links, and primary actions. Success, warning, and danger colors are semantic state colors. Presence colors are reserved for collaborators and must remain stable per workspace membership.

Selection and remote selection colors must be transparent enough to preserve Markdown readability. Reconnecting, pending local edits, and neutral warnings should not use red unless there is data loss or permission failure.

## Typography

Shell, navigation, inspector, and preview prose use the UI font. Markdown source editing and code blocks use a monospace font. Metadata, timestamps, badges, and secondary labels use smaller text while preserving contrast.

Editor text should be comfortable for long writing sessions. Use 14px or 15px text with roughly 1.55 line height. Do not use viewport-based font scaling or negative letter spacing. Preview headings should be clear but never hero-sized.

## Layout System

- Desktop uses left workspace navigation, center editor/preview, and right inspector.
- Split mode presents Markdown source and rendered preview as a connected but visually distinct experience.
- Side panels may collapse, but the center editor remains the primary work surface.
- Mobile layout may be deferred, but document state must not depend on desktop-only hidden state.
- Panel collapse must not reset editor focus, draft content, current mode, or sync status.
- The inspector is a contextual work surface, not a dashboard.

## Core Screens

- Workspace/document list: dense list with document state and recent activity.
- Collaborative editor: Markdown writing, presence, sync state, and mode switcher.
- Preview: rendered Markdown with heading, table, task, code, and quote styling.
- History: checkpoint list with author, time, message, and snapshot access.
- Inspector: comments, tasks, decisions, risks, activity, and document metadata.
- Offline/reconnect: subtle status surface that can show pending local edit count.
- Workflow foundation: `DocumentState` may appear as a small status, but hook builder UI is deferred.

## Component Rules

- Buttons use icon-only or icon-plus-text treatments for clear commands.
- Mode controls use a segmented control for Rich, Markdown, Split, and Preview.
- Status badges are compact and semantic: Draft, Review, Saved, Synced, Pending, and Offline should be short labels.
- Presence avatars use stable member colors from workspace membership.
- Remote cursor labels must not cover editable text for long.
- Comment markers attach to document locations but must not mutate the Markdown body.
- Properties live near the document title and must not look like Markdown body content.
- Links/backlinks should feel like document context, not a social graph dashboard.
- Empty states are short and actionable. They do not explain the entire product in-app.

## Avoid

- Marketing hero sections.
- Purple/blue gradient SaaS styling.
- Beige cozy notes-app styling.
- Nested cards.
- Overly rounded rectangles.
- Decorative orbs, bokeh, or illustration-first backgrounds.
- Chatbot-centered layouts as the primary UI.
- Analytics dashboards as the primary screen.
