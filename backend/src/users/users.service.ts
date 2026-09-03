import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  // No método create:
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }


  async findAll(options: { search?: string; page?: number; limit?: number }) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const whereCondition = options.search
      ? { name: Like(`%${options.search}%`) }
      : {};

    const [data, total] = await this.userRepository.findAndCount({
      where: whereCondition,
      order: { id: 'DESC' },
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não foi encontrado.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
    }

    if (!updateUserDto.password || updateUserDto.password.trim() === '') {
      // Se a senha veio vazia, removemos ela do DTO para o merge não sobrescrever a senha atual
      delete updateUserDto.password;
    } else {
      // Se o usuário digitou uma nova senha, geramos o hash do bcrypt
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByMatriculaOrEmail(matricula?: string, email?: string): Promise<User | null> {
    if (!matricula && !email) return null;

    return this.userRepository.findOne({
      where: [
        // Mapeia o parâmetro 'matricula' para a coluna 'registration' do MySQL
        ...(matricula ? [{ registration: matricula }] : []),
        ...(email ? [{ email }] : [])
      ]
    });
  }
}