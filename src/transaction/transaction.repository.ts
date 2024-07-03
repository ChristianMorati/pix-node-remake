import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionRepository {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
    ) { }

    save(transaction: Transaction): Promise<Transaction | undefined> {
        return this.transactionRepository.save(transaction);
    }

    findOne(id: number): Promise<Transaction | null> {
        return this.transactionRepository.findOneBy({ id });
    }

    findAll(): Promise<Transaction[]> {
        return this.transactionRepository.find();
    }

    findAllByAccountId(accountId: number, pixKeys: string[]): Promise<Transaction[]> {
        return this.transactionRepository.createQueryBuilder('transaction')
            .where('transaction.accountId = :accountId', { accountId })
            .orWhere('transaction.payeePixKey IN (:...pixKeys)', { pixKeys })
            .orderBy('transaction.date', 'DESC')
            .getMany();
    }

    async remove(id: number): Promise<void> {
        await this.transactionRepository.delete(id);
    }

    async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOneBy({ id });

        if (!transaction) {
            throw new BadRequestException(`Transaction with id ${id} not found`);
        }

        Object.assign(transaction, updateTransactionDto);
        return this.transactionRepository.save(transaction);
    }
}