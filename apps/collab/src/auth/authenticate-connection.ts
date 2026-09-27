import {
  verifyCollaborationToken,
  type CollaborationAccess,
  type CollaborationPrincipal,
} from "./collaboration-token.js";

/** Hocuspocus `onAuthenticate` payload 중 이 hook 이 쓰는 부분이다. */
export type AuthenticateConnectionPayload = {
  token: string;
  documentName: string;
  connectionConfig: { readOnly: boolean };
};

/** 인증된 연결의 context 다. presence 신원은 client 가 아니라 이 principal 로 정한다. */
export type AuthenticatedConnectionContext = Readonly<{
  principal: CollaborationPrincipal;
  documentId: string;
  access: CollaborationAccess;
}>;

export type ConnectionAuthenticatorOptions = Readonly<{
  signingSecret: string;
  now?: () => Date;
}>;

/**
 * 협업 연결마다 token 의 서명, 만료, 문서 범위, 권한을 검증한다.
 * 실패하면 throw 하고, Hocuspocus 는 그 연결에 permission-denied 를 보낸다.
 */
export function createConnectionAuthenticator(options: ConnectionAuthenticatorOptions) {
  const now = options.now ?? (() => new Date());

  return async function authenticateConnection(
    payload: AuthenticateConnectionPayload,
  ): Promise<AuthenticatedConnectionContext> {
    const grant = verifyCollaborationToken(payload.token, {
      signingSecret: options.signingSecret,
      documentName: payload.documentName,
      now: now(),
    });

    // Hocuspocus 는 이 객체를 그대로 연결 설정으로 쓰므로 재할당하지 않고 값을 바꾼다.
    if (grant.access === "read") payload.connectionConfig.readOnly = true;

    return { principal: grant.principal, documentId: grant.documentId, access: grant.access };
  };
}
