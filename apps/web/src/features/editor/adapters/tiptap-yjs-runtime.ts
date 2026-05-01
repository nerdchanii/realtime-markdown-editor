import { HocuspocusProvider } from "@hocuspocus/provider";
import type { AnyExtension } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";

import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

import {
  createIndexedDbOfflineDraftPersistence,
  type OfflineDraftPersistence,
} from "./indexeddb-offline-draft-persistence";
import { setAwarenessIdentity } from "./tiptap-yjs-awareness";

export type TiptapYjsRuntime = Readonly<{
  document: Y.Doc;
  markdown: Y.Text;
  provider: HocuspocusProvider;
  offlineDraftPersistence: OfflineDraftPersistence;
  extensions: readonly AnyExtension[];
  destroy: () => void;
}>;

export function createRuntime(session: CollaborationSessionDto): TiptapYjsRuntime {
  const document = new Y.Doc();
  const markdown = document.getText("markdown");
  const offlineDraftPersistence = createIndexedDbOfflineDraftPersistence(session, document);
  const provider = createProvider(session, document);
  const member = findCurrentMember(session);
  setAwarenessIdentity(provider, member);
  const extensions = createExtensions(document, provider, member);

  return {
    document,
    markdown,
    provider,
    offlineDraftPersistence,
    extensions,
    destroy: () => destroyRuntime(provider, offlineDraftPersistence, document),
  };
}

function createProvider(session: CollaborationSessionDto, document: Y.Doc) {
  return new HocuspocusProvider({
    url: session.realtimeUrl,
    name: session.documentKey,
    document,
  });
}

function createExtensions(
  document: Y.Doc,
  provider: HocuspocusProvider,
  member: RealtimeMemberDto,
): readonly AnyExtension[] {
  return [
    StarterKit.configure({ undoRedo: false, link: false }),
    Link.configure({ openOnClick: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Collaboration.configure({ document }),
    CollaborationCaret.configure({
      provider,
      user: { id: member.id, name: member.displayName, color: member.color },
      render: (user) => createCollaborationCaretMarker(user.color, user.name),
    }),
  ];
}

function createCollaborationCaretMarker(color: string, name: string): HTMLElement {
  const marker = globalThis.document.createElement("span");
  marker.classList.add("collaboration-carets__caret");
  marker.style.borderLeft = `2px solid ${color}`;
  marker.style.marginLeft = "-1px";
  marker.style.marginRight = "-1px";
  marker.style.pointerEvents = "none";
  marker.setAttribute("aria-hidden", "true");

  const label = globalThis.document.createElement("span");
  label.classList.add("collaboration-carets__label");
  label.style.backgroundColor = color;
  label.style.color = getReadableTextColor(color);
  label.textContent = name;
  marker.append(label);

  return marker;
}

function getReadableTextColor(backgroundColor: string) {
  const rgb = parseHexColor(backgroundColor);
  if (!rgb) return "#ffffff";

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.58 ? "#1f2328" : "#ffffff";
}

function parseHexColor(color: string): { r: number; g: number; b: number } | null {
  const normalized = color.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function findCurrentMember(session: CollaborationSessionDto): RealtimeMemberDto {
  const member = session.members.find((candidate) => candidate.id === session.currentMemberId);

  if (!member) {
    throw new Error("Collaboration session must include the current member");
  }

  return member;
}

function destroyRuntime(
  provider: HocuspocusProvider,
  offlineDraftPersistence: OfflineDraftPersistence,
  document: Y.Doc,
) {
  offlineDraftPersistence.destroy();
  provider.destroy();
  document.destroy();
}

export function replaceYText(markdown: Y.Text, nextMarkdown: string) {
  const currentMarkdown = markdown.toString();
  if (currentMarkdown === nextMarkdown) return;

  const prefixLength = commonPrefixLength(currentMarkdown, nextMarkdown);
  const suffixLength = commonSuffixLength(currentMarkdown, nextMarkdown, prefixLength);
  const deleteLength = currentMarkdown.length - prefixLength - suffixLength;
  const insertText = nextMarkdown.slice(prefixLength, nextMarkdown.length - suffixLength);

  if (deleteLength > 0) markdown.delete(prefixLength, deleteLength);
  if (insertText.length > 0) markdown.insert(prefixLength, insertText);
}

function commonPrefixLength(left: string, right: string): number {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;
  while (index < maxLength && left[index] === right[index]) index += 1;
  return index;
}

function commonSuffixLength(left: string, right: string, prefixLength: number): number {
  const maxLength = Math.min(left.length, right.length) - prefixLength;
  let length = 0;
  while (
    length < maxLength &&
    left[left.length - 1 - length] === right[right.length - 1 - length]
  ) {
    length += 1;
  }
  return length;
}
