import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

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
        return this.accountRepository.findOneBy({ id });
    }

    findOneByUserId(id: number): Promise<Account | null> {
        return this.accountRepository.findOneBy({ userId: id });
    }

    findOneByPixKey(payeePixKey: string): Promise<Account | null> {
        return this.accountRepository.findOneBy({ pixKeys: { value: payeePixKey } });
    }

    findOne(id: number): Promise<Account | null> {
        return this.accountRepository.findOne({
            where: { id }
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