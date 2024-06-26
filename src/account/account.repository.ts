import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { GetUserByPixKey } from 'src/user/dto/get-user-by-pix-key.dto';

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account)
        private accountRepository: Repository<Account>,
    ) { }

    save(account: Account): Promise<Account | undefined> {
        return this.accountRepository.save(account);
    }

    findOneById(id: number): Promise<Account | null> {
        return this.accountRepository.findOneByOrFail({ id });
    }

    findOneByUserId(id: number): Promise<Account | null> {
        return this.accountRepository.findOneByOrFail({ userId: id });
    }

    async findOneByPixKey(dto: GetUserByPixKey): Promise<Account | undefined> {
        const account = await this.accountRepository.findOneOrFail({
            where: { pixKeys: { type: dto.type, value: dto.value } },
        });

        return await this.findOneById(account.id);
    }

    findOne(id: number): Promise<Account | null> {
        return this.accountRepository.findOneOrFail({
            where: { id },
            relations: { pixKeys: true }
        });
    }

    findAll(): Promise<Account[]> {
        return this.accountRepository.find({
            relations: {
                pixKeys: true
            }
        });
    }

    async remove(id: number): Promise<void> {
        await this.accountRepository.delete(id);
    }
}