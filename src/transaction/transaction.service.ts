import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { InsufficientFundsError, PayeeAccountNotFound, PayerAccountNotFound } from 'src/errors';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from 'src/account/account.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository
  ) { }

  /**
  * Transfer amount between Accounts and create a Transaction Object.
  *
  * @param {CreateTransactionDto} createTransactionDto Dto params.
  * @returns {Transaction} Created Transaction Object.
  */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { payerUserId, payeePixKey, amount } = createTransactionDto;

    console.error(payerUserId, payeePixKey, amount)

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const payerAccount = await queryRunner.manager.findOneOrFail(Account, { where: { userId: payerUserId } });
      const payeeAccount = await queryRunner.manager.findOneOrFail(Account, { where: { pixKeys: { value: payeePixKey } } });

      if (payerAccount.id === payeeAccount.id) {
        console.error('Same account for payer and payee:', payerAccount, payeeAccount);
        throw new Error('Payer and payee accounts are the same');
      }

      if (!payerAccount) {
        throw new PayerAccountNotFound("")
      }

      if (!payeeAccount) {
        throw new PayeeAccountNotFound("")
      }

      if (payerAccount.balance < amount) {
        throw new InsufficientFundsError("")
      }

      // Update balances within the transaction amount
      payerAccount.withdraw(amount);
      payeeAccount.deposit(amount);

      const transaction: Transaction = new Transaction({
        success: true,
        amount,
        payerUserId,
        payeePixKey,
        accountId: payerAccount.id
      });

      await queryRunner.manager.save(Account, payerAccount);
      await queryRunner.manager.save(Account, payeeAccount);
      await queryRunner.manager.save(Transaction, transaction);

      // Commit transaction on success
      await queryRunner.commitTransaction();
      return transaction;

    } catch (error) {
      // Rollback transaction on error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
  * List all Transaction Objects.
  * @returns {Transaction[] | null} All Transactions or null.
  */
  async findAll(): Promise<Transaction[] | null> {
    return await this.transactionRepository.findAll();
  }

  /**
  * Find one Transaction using id.
  * @returns {Transaction | null} Especifc Transaction.
  */
  async findOne(id: number): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne(id);
    return transaction ? transaction : null;
  }

  /**
  * Find many Transactions using accountId.
  * @returns {Transaction[] | null} All Transactions by accountId.
  */
  async findAllByAccountId(accountId: number): Promise<Transaction[] | null> {
    const account = await this.accountRepository.findOne(accountId);
    if(!account.id) {
      throw new NotFoundException();
    }
    const pixKeys = account.pixKeys;
    const filterBy = pixKeys.map((pixKey) => pixKey.value)
    console.error(filterBy)
    const transactions = await this.transactionRepository.findAllByAccountId(accountId, filterBy);
    return transactions ? transactions : null;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
