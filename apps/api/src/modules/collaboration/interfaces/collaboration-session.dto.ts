import type { IssuedCollaborationSessionDto } from "@rme/contracts";

/** 제품 API 가 발급하는 협업 세션이다. 연결 token 을 포함한다. */
export type CollaborationSessionResponseDto = IssuedCollaborationSessionDto;

/** 협업 서버가 internal API 로 조회하는 세션이다. 연결 token 은 싣지 않는다. */
export type RuntimeCollaborationSessionResponseDto = Omit<
  IssuedCollaborationSessionDto,
  "connection"
>;
