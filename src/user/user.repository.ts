import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

export class UserRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async save(createUserDto: CreateUserDto): Promise<User> {
        return await this.userRepository.save(createUserDto);
    }

    async findOne(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                account: true
            }
        });
        return user || null;
    }

    async getNameById(id: number): Promise<{ name: string } | null> {
        const user = await this.userRepository.findOne({
            select: ["name"],
            where: { id }
        });
        return user ? { name: user.name } : null;
    }

    async findOneByPixKey(pixKey: string, type: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { account: { pixKeys: { value: pixKey, type: type } } }
        });
        return user || null;
    }

    async findOneByCpf(Cpf: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { cpf: Cpf } });
        return user || null;
    }

    async findOneByUsername(email: string): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ username: email });
        return user || null;
    }
}
