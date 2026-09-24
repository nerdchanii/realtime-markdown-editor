import { HocuspocusProvider } from "@hocuspocus/provider";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

import type { EditorSelectionSnapshot, PresenceMember } from "../ports/collaboration-adapter";

const appSelectionAwarenessKey = "rmeSelection";

export type AwarenessRuntime = Readonly<{
  provider: HocuspocusProvider;
}>;

export function useAwarenessPresence(
  session: CollaborationSessionDto | null,
  runtime: AwarenessRuntime | null,
  initialPresence: readonly PresenceMember[],
): readonly PresenceMember[] {
  const [presence, setPresence] = useState<readonly PresenceMember[]>([]);

  useEffect(() => {
    if (!session || !runtime) return undefined;

    const updatePresence = () => {
      const nextPresence = readRemotePresence(session, runtime);
      setPresence((currentPresence) =>
        isSamePresenceList(currentPresence, nextPresence) ? currentPresence : nextPresence,
      );
    };
    const timer = window.setTimeout(updatePresence, 0);

    runtime.provider.on("awarenessChange", updatePresence);
    runtime.provider.on("awarenessUpdate", updatePresence);

    return () => {
      window.clearTimeout(timer);
      runtime.provider.off("awarenessChange", updatePresence);
      runtime.provider.off("awarenessUpdate", updatePresence);
    };
  }, [runtime, session]);

  if (!session || !runtime) return initialPresence;
  return presence;
}

export function useAwarenessSelectionUpdate(
  session: CollaborationSessionDto | null,
  runtime: AwarenessRuntime | null,
) {
  const lastSelectionKeyRef = useRef<string | null>(null);

  return useCallback(
    (selection: EditorSelectionSnapshot) => {
      if (!session || !runtime) return;

      const nextSelectionKey = createSelectionKey(session, selection);
      if (lastSelectionKeyRef.current === nextSelectionKey) return;

      lastSelectionKeyRef.current = nextSelectionKey;
      publishSelectionAwareness(session, runtime.provider, selection);
    },
    [runtime, session],
  );
}

export function setAwarenessIdentity(provider: HocuspocusProvider, member: RealtimeMemberDto) {
  provider.setAwarenessField("member", member);
  provider.setAwarenessField("user", {
    id: member.id,
    name: member.displayName,
    color: member.color,
  });
  provider.setAwarenessField("updatedAt", new Date().toISOString());
}

function publishSelectionAwareness(
  session: CollaborationSessionDto,
  provider: HocuspocusProvider,
  selection: EditorSelectionSnapshot,
) {
  const member = findCurrentMember(session);
  const selectedRange = createPresenceRange(session, member, selection);

  provider.setAwarenessField(appSelectionAwarenessKey, selectedRange);
}

function createSelectionKey(session: CollaborationSessionDto, selection: EditorSelectionSnapshot) {
  return `${session.documentId}:${session.currentMemberId}:${selection.anchor}:${selection.head}`;
}

function createPresenceRange(
  session: CollaborationSessionDto,
  member: RealtimeMemberDto,
  selection: EditorSelectionSnapshot,
) {
  const anchor = Math.min(selection.anchor, selection.head);
  const head = Math.max(selection.anchor, selection.head);

  return {
    documentId: session.documentId,
    membershipId: member.id,
    anchor,
    head,
    isCollapsed: anchor === head,
  };
}

function readRemotePresence(
  session: CollaborationSessionDto,
  runtime: AwarenessRuntime,
): readonly PresenceMember[] {
  const awarenessStates = runtime.provider.awareness?.getStates();
  if (!awarenessStates) return [];

  return Array.from(awarenessStates.values())
    .map((state) => toPresenceMember(session, state))
    .filter((member): member is PresenceMember => member !== null);
}

function toPresenceMember(session: CollaborationSessionDto, state: unknown): PresenceMember | null {
  if (!isAwarenessState(state)) return null;
  if (state.member.id === session.currentMemberId) return null;
  if (!state.rmeCursor && !state.rmeSelection) return null;

  return {
    id: routePresenceId(state.member),
    name: state.member.displayName,
    color: state.member.color,
    range: describePresenceRange(state.rmeSelection ?? state.rmeCursor),
    ...toPresenceOffsets(state.rmeSelection ?? state.rmeCursor),
  };
}

type RuntimePresenceRange = Readonly<{
  anchor: number;
  head: number;
  isCollapsed?: boolean;
}>;

type RuntimeAwarenessState = Readonly<{
  member: RealtimeMemberDto;
  rmeCursor?: RuntimePresenceRange | null;
  rmeSelection?: RuntimePresenceRange | null;
}>;

function isAwarenessState(state: unknown): state is RuntimeAwarenessState {
  if (!state || typeof state !== "object") return false;

  const candidate = state as Partial<RuntimeAwarenessState>;
  return isRealtimeMember(candidate.member);
}

function isRealtimeMember(member: unknown): member is RealtimeMemberDto {
  if (!member || typeof member !== "object") return false;

  const candidate = member as Partial<RealtimeMemberDto>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.color === "string"
  );
}

function findCurrentMember(session: CollaborationSessionDto): RealtimeMemberDto {
  const member = session.members.find((candidate) => candidate.id === session.currentMemberId);

  if (!member) {
    throw new Error("Collaboration session must include the current member");
  }

  return member;
}

function routePresenceId(member: RealtimeMemberDto): string {
  const prefix = "member_";
  return member.id.startsWith(prefix) ? member.id.slice(prefix.length) : member.id;
}

function describePresenceRange(range: RuntimePresenceRange | null | undefined): string {
  if (!range) return "cursor shared";

  const anchor = Math.min(range.anchor, range.head);
  const head = Math.max(range.anchor, range.head);
  if (range.isCollapsed || anchor === head) return `cursor at ${head}`;

  return `selection ${anchor}-${head}`;
}

function toPresenceOffsets(range: RuntimePresenceRange | null | undefined) {
  if (!range) return {};

  return {
    anchor: Math.min(range.anchor, range.head),
    head: Math.max(range.anchor, range.head),
  };
}

function isSamePresenceList(
  left: readonly PresenceMember[],
  right: readonly PresenceMember[],
): boolean {
  if (left.length !== right.length) return false;

  return left.every((member, index) => isSamePresenceMember(member, right[index]));
}

function isSamePresenceMember(left: PresenceMember, right: PresenceMember | undefined): boolean {
  return (
    right !== undefined &&
    left.id === right.id &&
    left.name === right.name &&
    left.color === right.color &&
    left.range === right.range &&
    left.anchor === right.anchor &&
    left.head === right.head
  );
}
