import { Injectable } from '@nestjs/common';
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
}
