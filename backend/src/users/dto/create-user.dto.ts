import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'João Silva' })
    @IsNotEmpty()
    @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, { message: 'O nome deve conter apenas letras' })
    name: string;

    @ApiProperty({ example: 'joao@email.com' })
    @IsNotEmpty()
    @IsEmail({}, { message: 'E-mail inválido' })
    email: string;

    @ApiProperty({ example: '12345' })
    @IsNotEmpty()
    @IsNumberString({}, { message: 'A matrícula deve conter apenas números' })
    registration: string;

    @ApiProperty({ example: 'a1b2c3' })
    @IsNotEmpty()
    @Length(6, 6)
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'A senha deve ser alfanumérica de 6 dígitos' })
    password: string;
}
