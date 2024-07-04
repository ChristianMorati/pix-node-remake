import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { EntityNotFoundError } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        private usersRepository: UserRepository
    ) { }

    async getFullData(id: number) {
        try {
            const account = await this.usersRepository.findOne(id);
            return account;
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw new BadRequestException(`Account with userId: ${id} not founded`);
            }

            throw error;
        }
    }

    async getUserByPixKey(value: string, type: string): Promise<string> {
        try {
            const user = await this.usersRepository.findOneByPixKey(value, type);
            if (!user) throw new BadRequestException('User not found');

            return user.name;
        } catch (error) {
            throw error;
        }
    }
}
