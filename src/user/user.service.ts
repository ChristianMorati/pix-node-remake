import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private usersRepository: UserRepository
    ) { }

    async getFullData(id: number): Promise<User | null> {
        const user = await this.usersRepository.findOne(id);
        return user;
    }

    async findOneByUsername(username: string): Promise<User | null> {
        const user = await this.usersRepository.findOneByUsername(username);
        return user;
    }

    async getUserByPixKey(value: string, type: string): Promise<string> {
        const user = await this.usersRepository.findOneByPixKey(value, type);
        if (!user || !user.name) {
            throw new BadRequestException('User not found');
        }
        return user.name;
    }
}
