import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

export class UserRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findOneByUsername(username: string) {
        return await this.userRepository.findOne({ where: { username } });
    }

    async save(createUserDto: CreateUserDto) {
        return await this.userRepository.save(createUserDto);
    }

    async findOne(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            relations: {
                account: true
            }
        })
    }

    async findOneByPixKey(pixKey: string) {
        const user: User = await this.userRepository.findOneBy(
            { where: { account: { pixKeys: { value: pixKey } } } })
        return user;
    }
}