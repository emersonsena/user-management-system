import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock limpo do bcrypt na raiz
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password_123'),
    compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn((user, dto) => Object.assign(user, dto)),
};

describe('UsersService', () => {
    let service: UsersService;
    let repository: typeof mockUserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get(getRepositoryToken(User));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a user with hashed password', async () => {
            const createUserDto = { name: 'Test User', email: 'test@email.com', password: '123456' };
            const hashedPassword = 'hashed_password_123';

            repository.create.mockReturnValue({ ...createUserDto, password: hashedPassword });
            repository.save.mockResolvedValue({ id: 1, ...createUserDto, password: hashedPassword });

            const result = await service.create(createUserDto as any);

            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
            expect(repository.create).toHaveBeenCalled();
            expect(repository.save).toHaveBeenCalled();
            expect(result.id).toEqual(1);
        });
    });

    describe('findOne', () => {
        it('should return a user if found', async () => {
            const user = { id: 1, name: 'Test' };
            repository.findOne.mockResolvedValue(user);

            const result = await service.findOne(1);
            expect(result).toEqual(user);
        });

        it('should throw NotFoundException if user is not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should successfully update user and ignore password if empty', async () => {
            const existingUser = { id: 1, name: 'Old', email: 'old@email.com', password: 'old_hash' };
            const updateDto = { name: 'New Name', password: '' };

            repository.findOne.mockResolvedValueOnce(existingUser);
            repository.save.mockResolvedValue({ ...existingUser, ...updateDto });

            await service.update(1, updateDto as any);

            expect(updateDto.password).toBeUndefined();
            expect(repository.save).toHaveBeenCalled();
        });

        it('should throw ConflictException if email is already taken by another user', async () => {
            const existingUser = { id: 1, name: 'User', email: 'user@email.com' };
            const updateDto = { email: 'taken@email.com' };

            repository.findOne
                .mockResolvedValueOnce(existingUser)
                .mockResolvedValueOnce({ id: 2, email: 'taken@email.com' });

            await expect(service.update(1, updateDto as any)).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should successfully remove a user', async () => {
            const user = { id: 1, name: 'User' };
            repository.findOne.mockResolvedValue(user);
            repository.remove.mockResolvedValue(user);

            await service.remove(1);
            expect(repository.remove).toHaveBeenCalledWith(user);
        });
    });
});