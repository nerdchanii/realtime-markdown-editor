import { ArgumentsHost, Catch, type ExceptionFilter } from "@nestjs/common";

import {
  type BoundaryHttpHeaders,
  type BoundaryHttpResponse,
  envelopeForException,
  requestIdFromHeaders,
  writeApiErrorResponse,
} from "@/interfaces/http/api-error-response.js";

type BoundaryHttpRequest = Readonly<{
  headers: BoundaryHttpHeaders;
}>;

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<BoundaryHttpRequest>();
    const response = context.getResponse<BoundaryHttpResponse>();
    const requestId = requestIdFromHeaders(request.headers);

    if (response.headersSent) return;
    writeApiErrorResponse(response, envelopeForException(exception, requestId));
  }
}
