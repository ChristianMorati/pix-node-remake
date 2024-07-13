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

    async findOneById(id: number): Promise<Account | null> {
        return await this.accountRepository.findOneBy({ id });
    }

    async findOneByUserId(id: number): Promise<Account | null> {
        const account = await this.accountRepository.findOneBy({ userId: id });
        return account || null;
    }

    async findOneByPixKey(dto: GetUserByPixKey): Promise<Account | null> {
        const { type, value } = dto;
        const account = await this.accountRepository.findOne({
            where: { pixKeys: { type, value } },
        });

        if (!account) {
            return null;
        }

        return await this.findOne(account.id);
    }

    findOne(id: number): Promise<Account | null> {
        return this.accountRepository.findOne({
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