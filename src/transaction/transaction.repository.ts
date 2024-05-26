import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionRepository {
    constructor(
        @InjectRepository(Transaction)
        private accountRepository: Repository<Transaction>,
    ) { }

    save(account: Transaction): Promise<Transaction | undefined> {
        return this.accountRepository.save(account);
    }

    findOne(id: number): Promise<Transaction | null> {
        return this.accountRepository.findOneBy({ id });
    }

    findAll(): Promise<Transaction[]> {
        return this.accountRepository.find();
    }

    async remove(id: number): Promise<void> {
        await this.accountRepository.delete(id);
    }
}