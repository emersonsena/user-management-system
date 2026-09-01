import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'teste@email.com', description: 'E-mail do usuário para recuperação de senha' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    @IsEmail({}, { message: 'Informe um e-mail válido' })
    email: string;
}