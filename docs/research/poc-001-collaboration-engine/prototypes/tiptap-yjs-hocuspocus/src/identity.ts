import type { Member, MemberId } from './types'

export const MEMBERS: Record<MemberId, Member> = {
  alice: {
    id: 'alice',
    name: 'Alice Kim',
    initials: 'AK',
    role: 'PM',
    color: '#0969da',
  },
  bob: {
    id: 'bob',
    name: 'Bob Lee',
    initials: 'BL',
    role: 'Engineer',
    color: '#1a7f37',
  },
}

export function normalizeMemberId(value: string | null): MemberId {
  return value === 'bob' ? 'bob' : 'alice'
}

export function getMemberFromSearch(search: string): Member {
  const params = new URLSearchParams(search)
  return MEMBERS[normalizeMemberId(params.get('user'))]
}

export function getDocumentName(search: string): string {
  const params = new URLSearchParams(search)
  const requestedName = params.get('document')

  if (!requestedName) {
    return 'shared-poc-document'
  }

  return requestedName.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80) || 'shared-poc-document'
}

export function buildMemberUrl(targetMember: MemberId, search: string): string {
  const params = new URLSearchParams(search)
  params.set('user', targetMember)

  return `${window.location.pathname}?${params.toString()}`
}

