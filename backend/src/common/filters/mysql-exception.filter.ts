import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class MysqlExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError & { errno?: number; sqlMessage?: string }, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Código 1062 do MySQL refere-se a entrada duplicada (Duplicate Entry)
        if (exception.errno === 1062) {
            let message = 'Registro já cadastrado no sistema.';

            // Identifica se o conflito foi no e-mail com base na mensagem do erro
            if (exception.sqlMessage?.includes('email')) {
                message = 'Este e-mail já está cadastrado.';
            } else if (exception.sqlMessage?.includes('registration')) {
                message = 'Esta matrícula já está cadastrada.';
            }

            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: message,
                error: 'Bad Request',
            });
        }

        // Para qualquer outro erro do TypeORM que não seja duplicidade, mantém o comportamento padrão ou retorna 500
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro interno no servidor.',
        });
    }
}