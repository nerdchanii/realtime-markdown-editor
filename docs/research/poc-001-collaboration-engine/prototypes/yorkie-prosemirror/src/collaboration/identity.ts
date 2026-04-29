export type MemberId = 'alice' | 'bob';

export type MemberIdentity = {
  id: MemberId;
  name: string;
  color: string;
  role: string;
};

export const members: Record<MemberId, MemberIdentity> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    color: '#0969da',
    role: 'Editor',
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    color: '#1a7f37',
    role: 'Reviewer',
  },
};

export const defaultDocumentKey = 'poc-yorkie-prosemirror-shared-markdown';

export function getMemberFromSearch(search: string): MemberIdentity {
  const params = new URLSearchParams(search);
  const user = params.get('user')?.toLowerCase();

  if (user === 'bob') {
    return members.bob;
  }

  return members.alice;
}

export function getDocumentKeyFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  const documentKey = params.get('doc')?.trim();

  if (!documentKey || !/^[a-z0-9][a-z0-9-]{2,72}$/i.test(documentKey)) {
    return defaultDocumentKey;
  }

  return documentKey;
}

export function getPeerUrl(member: MemberIdentity, documentKey: string): string {
  const peer = member.id === 'alice' ? members.bob : members.alice;
  const params = new URLSearchParams({
    user: peer.id,
    doc: documentKey,
  });

  return `${window.location.pathname}?${params.toString()}`;
}
