import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, QueryRunner } from 'typeorm';
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
import { PixKeyType } from 'src/pix-key/enum/pix-key-type.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository
  ) { }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { payerUserId, payeePixKey, amount, payeePixKeyType } = createTransactionDto;
    const queryRunner = this.entityManager.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const payerAccount = await this.accountRepository.findOneByUserId(payerUserId);
      const payeeAccount = await this.accountRepository.findOneByPixKey({ value: payeePixKey, type: PixKeyType[payeePixKeyType] });

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

      const payerAccount = await this.accountRepository.findOneByPixKey({ value: payeePixKey, type: PixKeyType[payeePixKeyType] });
      const payeeAccount = await this.accountRepository.findOneByUserId(payerUserId);

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

  private async findAccountByUserId(queryRunner: QueryRunner, userId: number): Promise<Account> {
    try {
      return await queryRunner.manager.findOneOrFail(Account, {
        where: { userId },
        relations: ['pixKeys'],
      });
    } catch (error) {
      throw new PayerAccountNotFound(`Payer account with user ID ${userId} not found.`);
    }
  }

  private async findAccountByPixKey(queryRunner: QueryRunner, pixKey: string, pixKeyType: string): Promise<Account> {
    try {
      const accounts = await queryRunner.manager.find(Account, {
        where: { pixKeys: { value: pixKey, type: pixKeyType } },
        relations: ['pixKeys'],
      });
      if (accounts.length === 0) {
        throw new PayeeAccountNotFound(`Payee account with Pix key ${pixKey} and type ${pixKeyType} not found.`);
      }
      return accounts[0];
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

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return await this.transactionRepository.update(id, updateTransactionDto);
  }

  async remove(id: number) {
    return await this.transactionRepository.remove(id);
  }
}
