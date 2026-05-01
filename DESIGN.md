---
title: DESIGN.md
version: 0.3.1
product: Realtime collaborative Markdown editor
design_intent: IDE-like dense technical writing workspace for collaborative engineering documents
---

# DESIGN.md

## 1. Design Intent

This product is a dense technical writing workspace for engineering teams.

The UI should feel closer to an IDE or professional documentation tool than a personal note app, dashboard, or marketing SaaS page.

The first screen is the collaborative editor itself.

Primary goals:

- Editor-first writing experience.
- Clear workspace and project context.
- Dense but readable file navigation.
- Rich TipTap-based Markdown authoring.
- Compact history-first inspector.
- Explicit document save/sync state near the document context.
- Settings separated by Workspace, Project, and User scope.

## 2. Image Reference Usage

Images are visual references only.

When image references and this document conflict, this DESIGN.md is the source of truth.

Use images for:

- Overall layout direction.
- Relative panel placement.
- Density.
- Visual tone.
- Component examples.

Do not copy images blindly.

Do not implement:

- Explanatory callout labels from design boards.
- Rounded cards around every pane.
- Extra buttons shown only in mockups.
- Duplicate presence indicators.
- Decorative details not described in this document.
- Global app-level bottom status bars or footer chrome if they appear in generated mockups.

## 3. Product Information Architecture

The main workspace consists of:

```txt
Top Bar
Explorer
TipTap Editor
History Inspector
Settings Panel
```

Primary flow:

```txt
Workspace > Project
-> Explorer
-> Document Tabs
-> TipTap Editor
-> History
-> Settings via Profile Menu
```

There is no global bottom status bar in the first implementation.

If a status bar is used, it belongs only inside the center editor panel and only represents the current document/editor state.

## 4. Shell Layout

The app uses a full-height, IDE-like pane layout.

```txt
+--------------------------------------------------------------+
| Top Bar                                                      |
+---------------+----------------------------+-----------------+
| Explorer      | Editor                     | History         |
|               |                            |                 |
+---------------+----------------------------+-----------------+
```

Default desktop layout:

- Left Explorer: 260px.
- Right History Inspector: 280px.
- Top Bar: 48px.
- Tab Strip: 40px.
- Toolbar: 44px.
- Editor measure: around 760px.

The center editor should remain the primary work surface.

## 5. Pane vs Card Rules

A pane is a docked workspace region separated by thin dividers.

A card is a grouped or floating content container with radius, padding, and sometimes shadow.

The workspace shell is not a card dashboard.

Use panes for:

- Top bar.
- Explorer.
- Editor area.
- History inspector.

Use cards only for:

- Dropdown menus.
- Popovers.
- Modals.
- Settings panels.
- Code blocks.
- Quote/callout blocks.
- Repeated list items only when necessary.

Do not wrap the main editor body in a large rounded card.

Do not create nested cards inside the main workspace.

Do not make Explorer, Editor, and History look like separate floating cards.

## 6. Border and Radius Rules

The app should feel like a docked IDE workspace.

Use subtle 1px borders for:

- Top bar bottom border.
- Explorer right border.
- History inspector left border.
- Tab strip bottom border.
- Toolbar bottom border.
- Row separators where needed.

Use radius only for:

- Search inputs.
- Buttons.
- Dropdowns.
- Metadata chips.
- Profile menu.
- Project overflow menu.
- Settings panel.
- Code blocks.
- Quote/callout blocks.

Default radius:

```txt
small controls: 4px
chips/buttons/inputs: 6px
modals/popovers: 8px
```

Avoid:

- Large rounded editor containers.
- Rounded pane edges between shell panels.
- Excessive shadows in the main shell.
- Card-like wrappers around the editor body.
- App-wide border-wrapped bottom status bars.

## 7. Top Bar

The top bar is compact and functional.

Required structure:

```txt
Workspace > Project       Command/Search Bar       Theme Toggle | Profile
```

Rules:

- Show workspace/project hierarchy on the left.
- Use one centered command/search bar.
- Do not show a Share button in the first implementation.
- Do not show collaborator avatars in the top bar.
- Do not show a standalone settings gear.
- Settings are accessed from the profile menu.
- Keep the top bar visually calm and around 48px high.

## 8. Profile Menu

Clicking the profile avatar opens a dropdown.

Required items:

```txt
Profile
Settings
Notifications
Keyboard Shortcuts
Sign out
```

The Settings item opens the main settings panel.

## 9. Explorer

The Explorer is an IDE-like file tree.

It should be dense, readable, and stable.

Required structure:

```txt
WORKSPACE_ROOT
`- Projects
   `- Core Engine
      |- docs
      |  |- Overview.md
      |  |- Architecture.md
      |  |- Review Plan.md
      |  |- Runbook.md
      |  `- Changelog.md
      `- templates
         |- PRD Template.md
         |- ADR Template.md
         `- Review Template.md
```

Rules:

- Active document row uses a subtle background highlight and left accent.
- Project templates are visible inside each project.
- Project actions are hidden behind the project row overflow menu.
- Do not permanently expose `+ New from template` beside the folder row.
- Keep bottom utilities minimal.

Allowed bottom utilities:

```txt
Trash
Help & Support
```

Remove from first implementation:

```txt
Workspace Settings
Extensions
Import
```

## 10. Project Overflow Menu

The project row has an overflow menu.

Example:

```txt
Core Engine    ...
```

Menu items:

```txt
New document
New from template
Manage templates
Project settings
Rename project
Archive project
```

Project-scoped actions live here.

## 11. Editor

The editor is the primary work surface.

Use TipTap as the rich Markdown authoring layer.

Required structure:

```txt
Document Tabs
TipTap Toolbar
Document Header
Rich Text Body
Optional Editor-local Status Strip
```

Do not implement raw Markdown source mode or split preview in the first implementation.

Do not add a global bottom status bar below the entire app shell.

### Document Tabs

Tabs appear above the toolbar.

They provide multi-document context without turning the app into a full IDE.

### TipTap Toolbar

The toolbar is attached to the editor surface.

Include:

- Heading selector.
- Bold.
- Italic.
- Strike.
- Inline code.
- Link.
- Bulleted list.
- Ordered list.
- Task list.
- Table.
- Image/media.
- Code block.
- Undo / redo.
- More menu.

The toolbar should feel like a compact editing strip, not a large app header.

### Document Header

The document header includes:

```txt
Title
Owner
Sprint
Status
Updated
Saved / Sync state
```

Example:

```txt
Review Plan: Q3 Infrastructure

Owner: Alice
Sprint: CE Review
Status: Draft
Updated: 12m ago
Synced
```

Metadata chips should be near the title and must not look like Markdown body content.

Document save/sync state should appear as compact metadata or subtle inline status near the document header by default.

## 12. Rich Text Body

The editor body supports:

- Headings.
- Paragraphs.
- Lists.
- Task lists.
- Code blocks.
- Quotes.
- Inline code.
- Links.
- Tables.

The main text area should use a comfortable centered measure.

It should not be wrapped in a large card.

## 13. Collaboration Presence

Presence appears only inside the editor surface.

Allowed:

- Remote cursor label.
- Remote selection highlight.
- Small name tag anchored to cursor or selection.
- Stable collaborator color.

Not allowed:

- Presence avatars in the top bar.
- Duplicate presence indicators in multiple places.
- Presence labels that permanently cover editable text.
- Presence data becoming Markdown content.

### Current Limitation

Current presence only communicates cursor or selection position.

This is acceptable for first implementation, but it is a known limitation.

Future improvements:

- Section-level presence.
- Comment-aware presence.
- Better anchored labels.
- Temporary fade behavior.
- Reconnecting/offline collaborator state.
- Presence that communicates reading vs editing intent.

## 14. History Inspector

The right inspector is History only for the first implementation.

Required structure:

```txt
History
Today
- Bob updated overview section
- Alice added infrastructure definition block
- Alice shared document
- Dave added objectives

View all history
```

Remove from first implementation:

```txt
Outline tab
Comments tab
Document Details
Collaborators section
```

Rationale:

- History directly supports revision requirements.
- Comments and outline can be added later.
- Document details are not needed in the main editor view.
- Collaborator count should not require a dedicated inspector section.

## 15. Settings

Settings are opened from:

```txt
Profile Menu > Settings
```

Settings use a centered panel or modal with side navigation.

Required side tabs:

```txt
Workspace
Project
User
```

### Workspace Settings

Sections:

```txt
General
Members & Roles
Templates
Permissions
```

Examples:

- Workspace name.
- Workspace ID.
- Region.
- Time zone.
- Members and roles.
- Workspace-level template policy.
- Permission defaults.

### Project Settings

Sections:

```txt
General
Document Structure
Templates
Review Workflow
Revision Policy
Danger Zone
```

Examples:

- Project name.
- Project slug/path.
- Project template folder.
- Default document template.
- Review required before publish.
- Revision retention policy.
- Archive project.

### User Settings

Sections:

```txt
Profile
Editor Preferences
Theme
Notifications
Keyboard Shortcuts
Sessions
```

Examples:

- Display name.
- Avatar.
- Editor density.
- Font size.
- Theme.
- Notification preferences.
- Keyboard shortcuts.

## 16. Document State

There is no global bottom status bar.

Document state appears near the document header as compact metadata chips or subtle inline status text.

Allowed document state:

```txt
Status: Draft / Review / Published
Saved / Saving
Synced / Offline / Reconnecting
Updated timestamp
```

Examples:

```txt
Status: Draft
Saved
Synced
Updated: 12m ago
```

Do not create a bordered app-wide bottom status bar.

Do not reserve persistent bottom chrome across the full layout for word count, character count, or collaborator count.

If additional document/editor state is needed, it may appear as an editor-local status strip inside the center editor panel only.

## 17. Editor-local Status Strip

An editor-local status strip is optional.

It is allowed only when it is scoped to the current document and visually belongs to the center editor panel.

Allowed content:

```txt
Word count
Character count
Saved / Saving
Synced / Offline / Reconnecting
Editing mode
```

Rules:

- It must not span the full app width.
- It must not extend under the Explorer or History inspector.
- It must not look like a global application footer.
- It should use a simple top border or subtle separator, not a rounded bordered container.
- It should be visually attached to the editor panel.
- It should not contain workspace-level actions.
- It should not duplicate presence labels.
- It should be removable without breaking the shell layout.

Recommended first implementation:

```txt
Prefer document-header metadata for save/sync state.
Do not implement the editor-local status strip unless it materially improves usability.
```

## 18. Sync and Offline States

Supported states:

```txt
Synced
Saving
Offline
Reconnecting
Pending local edits
Merge completed
```

Examples:

```txt
Offline · 3 local edits pending
Reconnecting...
Synced · local edits merged
```

Offline and reconnect states should be calm unless data loss is likely.

## 19. Templates

Templates are project-scoped in the first implementation.

Each project may contain a `templates` folder.

Example:

```txt
Projects
`- Core Engine
   |- docs
   `- templates
      |- PRD Template.md
      |- ADR Template.md
      `- Review Template.md
```

Template actions are available from the project overflow menu:

```txt
New from template
Manage templates
Project settings
```

Workspace-level template policy is configured in:

```txt
Profile Menu > Settings > Workspace > Templates
```

Project-level template defaults are configured in:

```txt
Profile Menu > Settings > Project > Templates
```

## 20. Visual Do / Don't

Do:

- Use IDE-like pane layout.
- Use thin separators.
- Use compact spacing.
- Use clear active row highlights.
- Use restrained blue accents.
- Use small metadata chips.
- Keep the editor central.
- Keep document state close to the document header.
- Keep any optional status strip scoped to the center editor panel only.

Do not:

- Turn panes into floating cards.
- Add rounded borders around every area.
- Add a Share button by default.
- Duplicate presence.
- Add unused Extensions or Import surfaces.
- Add dashboard-style widgets.
- Add decorative gradients or marketing visuals.
- Add a global bottom status bar.
- Wrap the editor body in a bordered footer-like container.
- Let status UI span under Explorer or History.

## 21. Deferred Scope

Deferred:

- Raw Markdown source mode.
- Split preview mode.
- Outline panel.
- Comments panel.
- Import flow.
- Extensions surface.
- Document Details panel.
- Global bottom status bar.
- Advanced revision compare.
- Rollback UI.
- Public sharing.
- Billing.
- Mobile-optimized layout.

## 22. Implementation Checklist

Before marking the UI complete, verify:

- Top bar has Workspace > Project, command bar, theme toggle, profile menu.
- No standalone settings gear exists.
- Profile menu contains Settings.
- Settings panel has Workspace / Project / User side tabs.
- Explorer has docs and templates under the project.
- Project actions are inside `...`.
- Sidebar bottom only has Trash and Help & Support.
- Editor is not wrapped in a large rounded card.
- TipTap toolbar is compact and attached to editor area.
- Document state is shown near the document header by default.
- No global bottom status bar exists.
- Any optional status strip is scoped to the center editor panel only.
- Presence appears only inside editor content.
- Right inspector is History only.
- Document Details is removed.
