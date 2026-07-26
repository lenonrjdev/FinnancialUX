import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const error = exception as { code?: string; message?: string; status?: number; getStatus?: () => number };

    if (typeof error.getStatus === "function") {
      const status = error.getStatus();
      return response.status(status).send({
        statusCode: status,
        message: error.message,
      });
    }

    if (error.code === "P2002") {
      return response.status(HttpStatus.CONFLICT).send({
        statusCode: HttpStatus.CONFLICT,
        message: "Já existe um registro com esses dados.",
      });
    }

    if (error.code === "P2025") {
      return response.status(HttpStatus.NOT_FOUND).send({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Registro não encontrado.",
      });
    }

    this.logger.error(error.message ?? "Erro interno não identificado", exception instanceof Error ? exception.stack : undefined);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Não foi possível concluir a operação.",
    });
  }
}
