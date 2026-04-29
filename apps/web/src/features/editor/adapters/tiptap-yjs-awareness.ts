import { HocuspocusProvider } from "@hocuspocus/provider";
import { useCallback, useEffect, useState } from "react";

import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

import type { EditorSelectionSnapshot, PresenceMember } from "../ports/collaboration-adapter";

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
      setPresence(readRemotePresence(session, runtime));
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
  return useCallback(
    (selection: EditorSelectionSnapshot) => {
      if (!session || !runtime) return;

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

  setAwarenessIdentity(provider, member);
  provider.setAwarenessField("cursor", {
    ...selectedRange,
    anchor: selectedRange.head,
  });
  provider.setAwarenessField("selection", selectedRange);
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
  if (!state.cursor && !state.selection) return null;

  return {
    id: routePresenceId(state.member),
    name: state.member.displayName,
    color: state.member.color,
    range: describePresenceRange(state.selection ?? state.cursor),
  };
}

type RuntimePresenceRange = Readonly<{
  anchor: number;
  head: number;
  isCollapsed?: boolean;
}>;

type RuntimeAwarenessState = Readonly<{
  member: RealtimeMemberDto;
  cursor?: RuntimePresenceRange | null;
  selection?: RuntimePresenceRange | null;
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
