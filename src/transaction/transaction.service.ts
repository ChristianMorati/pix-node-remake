import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { InsufficientFundsError, PayeeAccountNotFound, PayerAccountNotFound } from 'src/errors';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from 'src/account/account.repository';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from './enum/transaction-type.enum';
import { TransactionDto } from './dto/transaction.dto';

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
  */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { payerUserId, payeePixKey, amount, payeePixKeyType } = createTransactionDto;
    const queryRunner = this.entityManager.connection.createQueryRunner();

    await queryRunner.startTransaction();
    console.error(createTransactionDto);

    try {
      const payerAccount = await this.findAccountByUserId(queryRunner, payerUserId);
      const payeeAccount = await this.findAccountByPixKey(queryRunner, payeePixKey, payeePixKeyType);

      this.validateAccounts(payerAccount, payeeAccount, amount);

      this.updateBalances(payerAccount, payeeAccount, amount);

      const transaction = this.createTransactionObject(
        payeePixKeyType,
        payerAccount.id,
        createTransactionDto
      );
      transaction.type = TransactionType.TRANSACTION

      await this.saveEntities(queryRunner, payerAccount, payeeAccount, transaction);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refund(transactionDto: TransactionDto): Promise<Transaction> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    const { payerUserId, payeePixKey, amount, payeePixKeyType } = transactionDto;

    await queryRunner.startTransaction();
    try {
      const transaction: Transaction = await this.transactionRepository.findOne(transactionDto.id);
      transaction.type = TransactionType.REFUND;

      const createdTransaction = await queryRunner.manager.save(Transaction, transaction);

      const payerAccount = await this.findAccountByUserId(queryRunner, payerUserId);
      const payeeAccount = await this.findAccountByPixKey(queryRunner, payeePixKey, payeePixKeyType);

      this.validateAccounts(payerAccount, payeeAccount, amount);

      this.updateBalances(payeeAccount, payerAccount, amount);

      await this.saveEntities(queryRunner, payerAccount, payeeAccount, transaction);

      await queryRunner.commitTransaction();
      return createdTransaction;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findAccountByUserId(queryRunner, userId: number): Promise<Account> {
    try {
      return await queryRunner.manager.findOneOrFail(Account, { where: { userId } });
    } catch (error) {
      throw new PayerAccountNotFound(`Payer account with user ID ${userId} not found.`);
    }
  }

  private async findAccountByPixKey(queryRunner, pixKey: string, pixKeyType: string): Promise<Account> {
    try {
      return await queryRunner.manager.findOneOrFail(Account, {
        where: { pixKeys: { value: pixKey, type: pixKeyType } },
      });
    } catch (error) {
      throw new PayeeAccountNotFound(`Payee account with Pix key ${pixKey} and type ${pixKeyType} not found.`);
    }
  }

  private validateAccounts(payerAccount: Account, payeeAccount: Account, amount: number): void {
    if (payerAccount.id === payeeAccount.id) {
      throw new Error('Payer and payee accounts are the same.');
    }

    if (payerAccount.balance < amount) {
      throw new InsufficientFundsError('Insufficient funds in payer account.');
    }
  }

  private updateBalances(payerAccount: Account, payeeAccount: Account, amount: number): void {
    payerAccount.withdraw(amount);
    payeeAccount.deposit(amount);
  }

  private createTransactionObject(
    payeePixKeyType: string,
    payerAccountId: number,
    createTransactionDto: CreateTransactionDto | RefundTransactionDto
  ): Transaction {
    const { amount, payerUserId, payeePixKey } = createTransactionDto;
    console.error(createTransactionDto)
    return new Transaction({
      success: true,
      amount,
      payerUserId,
      payeePixKey,
      accountId: payerAccountId,
      payeePixKeyType,
    });
  }

  private async saveEntities(queryRunner, payerAccount: Account, payeeAccount: Account, transaction: Transaction): Promise<void> {
    await queryRunner.manager.save(Account, payerAccount);
    await queryRunner.manager.save(Account, payeeAccount);
    await queryRunner.manager.save(Transaction, transaction);
  }

  async findAll(): Promise<Transaction[] | null> {
    return await this.transactionRepository.findAll();
  }

  async findOne(id: number): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne(id);
    return transaction ? transaction : null;
  }

  async findAllByAccountId(accountId: number): Promise<Transaction[] | null> {
    const account = await this.accountRepository.findOne(accountId);
    if (!account.id) {
      throw new NotFoundException();
    }
    const pixKeys = account.pixKeys;
    const filterBy = pixKeys.map((pixKey) => pixKey.value);
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
