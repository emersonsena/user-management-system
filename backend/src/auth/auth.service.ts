import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) { }

    async login(loginDto: LoginDto) {
        const { registration, email, password } = loginDto;

        if (!registration && !email) {
            throw new BadRequestException('Matrícula ou e-mail é obrigatório');
        }

        // Busca o usuário baseado no parâmetro informado
        const user = await this.usersService.findByMatriculaOrEmail(registration, email);

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // Compara o hash da senha enviada com o hash do banco de dados
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        const token = this.generateToken(user);

        return {
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                registration: user.registration,
            },
        };
    }

    async forgotPassword(email: string) {
        if (!email) {
            throw new BadRequestException('E-mail é obrigatório');
        }

        const user = await this.usersService.findByMatriculaOrEmail(undefined, email);

        // Retorna mensagem genérica para evitar enumeração de e-mails de usuários
        if (!user) {
            return {
                message: 'Se o e-mail existir, você receberá um link de recuperação',
            };
        }

        const resetToken = this.jwtService.sign(
            { sub: user.id, type: 'password-reset' },
            { expiresIn: '30m' }
        );

        console.log(`
      ========== EMAIL DE RECUPERAÇÃO ==========
      Para: ${user.email}
      Assunto: Recuperar Senha
      
      Clique no link para resetar sua senha:
      http://localhost:4200/reset-password?token=${resetToken}
      
      Este link expira em 30 minutos.
      ==========================================
    `);

        return {
            message: 'Se o e-mail existir, você receberá um link de recuperação',
            resetToken, // Útil para testes no Swagger
        };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) {
            throw new BadRequestException('Token e nova senha são obrigatórios');
        }

        let decoded: any;
        try {
            decoded = this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }

        if (decoded.type !== 'password-reset') {
            throw new UnauthorizedException('Token inválido para esta operação');
        }

        const user = await this.usersService.findOne(decoded.sub);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Gera o hash de segurança da nova senha com fator de custo 10
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Salva a nova senha criptografada
        await this.usersService.update(user.id, { password: hashedPassword });

        return {
            message: 'Senha resetada com sucesso',
        };
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

        return this.jwtService.sign(payload);
    }
}