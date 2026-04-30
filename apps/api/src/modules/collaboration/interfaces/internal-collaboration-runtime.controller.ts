import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Put,
} from "@nestjs/common";
import type { CollaborationSessionResponseDto } from "@rme/contracts";

import { decodeDocumentKey } from "@/modules/collaboration/interfaces/document-key-codec.js";
import { mapCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import {
  ProductCollaborationDocumentNotFoundError,
  type CollaborationDocumentKey,
} from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";
import { LoadRuntimeCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import {
  LoadLiveYjsDocumentStateUseCase,
  StoreLiveYjsDocumentStateUseCase,
} from "@/modules/collaboration/use-cases/live-yjs-document-state-use-case.js";

type LiveYjsStateResponseDto = Readonly<{
  stateBase64: string;
}>;

@Controller("collaboration/internal")
export class InternalCollaborationRuntimeController {
  constructor(
    @Inject(LoadRuntimeCollaborationSessionUseCase)
    private readonly loadRuntimeSession: LoadRuntimeCollaborationSessionUseCase,
    @Inject(LoadLiveYjsDocumentStateUseCase)
    private readonly loadLiveYjsDocumentState: LoadLiveYjsDocumentStateUseCase,
    @Inject(StoreLiveYjsDocumentStateUseCase)
    private readonly storeLiveYjsDocumentState: StoreLiveYjsDocumentStateUseCase,
  ) {}

  @Get("document-sessions/:encodedDocumentKey")
  async getDocumentSession(
    @Param("encodedDocumentKey") encodedDocumentKey: string,
  ): Promise<CollaborationSessionResponseDto> {
    const documentKey = decodeDocumentKey(encodedDocumentKey);
    const session = await this.loadRuntimeSession.execute({ documentKey });
    if (!session) throw new NotFoundException("Collaboration session not found.");

    return mapCollaborationSessionToResponseDto(session);
  }

  @Get("yjs-documents/:encodedDocumentKey/state")
  async getLiveYjsDocumentState(
    @Param("encodedDocumentKey") encodedDocumentKey: string,
  ): Promise<LiveYjsStateResponseDto> {
    const documentKey = decodeDocumentKey(encodedDocumentKey);
    const state = await this.loadLiveYjsDocumentState.execute({
      documentKey: documentKey as CollaborationDocumentKey,
    });
    if (!state) throw new NotFoundException("Live Yjs document state not found.");

    return { stateBase64: Buffer.from(state).toString("base64") };
  }

  @Put("yjs-documents/:encodedDocumentKey/state")
  async putLiveYjsDocumentState(
    @Param("encodedDocumentKey") encodedDocumentKey: string,
    @Body() body: { stateBase64?: unknown },
  ): Promise<void> {
    if (typeof body.stateBase64 !== "string") {
      throw new BadRequestException("stateBase64 is required.");
    }

    const documentKey = decodeDocumentKey(encodedDocumentKey);
    try {
      await this.storeLiveYjsDocumentState.execute({
        documentKey: documentKey as CollaborationDocumentKey,
        state: new Uint8Array(Buffer.from(body.stateBase64, "base64")),
      });
    } catch (error) {
      if (error instanceof ProductCollaborationDocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
