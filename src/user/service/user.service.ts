import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class UsersService {
    constructor(
        private usersRepository: UserRepository
    ) { }

    async getFullData(id: number) {
        const user = await this.usersRepository.findOne(id);
        return user;
    }

    async getUserByPixKey(pixKey: string, type: string): Promise<string> {
        try {
            const user = await this.usersRepository.findOneByPixKey(pixKey, type);
            if (!user) throw new NotFoundException('User not found');

            return user.name;
        } catch (error) {
            throw error;
        }
    }
}
