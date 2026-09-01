import { IsOptional, IsString, IsNotEmpty, ValidateIf, IsEmail } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiPropertyOptional({ example: '1001', description: 'Matrícula do usuário' })
    @ValidateIf((o) => !o.email || o.registration !== undefined)
    @IsNotEmpty({ message: 'Matrícula não pode ser vazia' })
    @IsString({ message: 'A matrícula deve ser texto (string)' })
    registration?: string;

    @ApiPropertyOptional({ example: 'usuario@wenlock.com', description: 'E-mail do usuário' })
    @ValidateIf((o) => !o.registration || o.email !== undefined)
    @IsNotEmpty({ message: 'E-mail não pode ser vazio' })
    @IsEmail({}, { message: 'Formato de e-mail inválido' })
    email?: string;

    @ApiProperty({ example: '654321', description: 'Senha de acesso' })
    @IsNotEmpty({ message: 'A senha é obrigatória' })
    @IsString({ message: 'A senha deve ser texto (string)' })
    password: string;
}