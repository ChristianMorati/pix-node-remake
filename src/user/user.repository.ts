import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

export class UserRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async save(createUserDto: CreateUserDto) {
        return await this.userRepository.save(createUserDto);
    }

    async findOne(id: number) {
        return await this.userRepository.findOneOrFail({
            where: { id },
            relations: {
                account: true
            }
        })
    }

    async getNameById(id: number) {
        return await this.userRepository.findOneOrFail({
            select: ["name"],
            where: { id }
        })
    }

    async findOneByPixKey(pixKey: string, type: string): Promise<User | null> {
        const user: User = await this.userRepository.findOne({ where: { account: { pixKeys: { value: pixKey, type: type } } } });
        return user || null;
    }

    async findOneByCpf(Cpf: string): Promise<User> {
        return await this.userRepository.findOneOrFail({ where: { cpf: Cpf } });
    }

    async findOneByUsername(email: string): Promise<User> {
        return await this.userRepository.findOneByOrFail({ username: email });
    }
}

