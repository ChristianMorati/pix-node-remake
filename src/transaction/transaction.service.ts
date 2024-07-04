import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { InsufficientFundsError, SameAccountPayee } from 'src/errors';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from 'src/account/account.repository';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from './enum/transaction-type.enum';
import { TransactionDto } from './dto/transaction.dto';
import { PixKeyType } from 'src/pix-key/enum/pix-key-type.enum';
import { EventsGateway } from 'src/sse';
import { TransactionEventsTypesEnum } from './enum';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly eventsGateway: EventsGateway
  ) { }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { payerUserId, payeePixKey, amount, payeePixKeyType } = createTransactionDto;

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction();
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

      const eventName = TransactionEventsTypesEnum.TRANSACTION;
      this.sendTransactionUpdateEvent(payeeAccount, transaction, eventName);

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
    const { payerUserId, payeePixKey, amount, payeePixKeyType } = transactionDto;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();

      const transaction: Transaction = await this.transactionRepository.findOne(transactionDto.id);
      transaction.type = TransactionType.REFUND;

      const createdTransaction = await queryRunner.manager.save(Transaction, transaction);

      const payerAccount = await this.accountRepository.findOneByPixKey({ value: payeePixKey, type: PixKeyType[payeePixKeyType] });
      const payeeAccount = await this.accountRepository.findOneByUserId(payerUserId);

      this.validateAccounts(payerAccount, payeeAccount, amount);
      this.updateBalances(payerAccount, payeeAccount, amount);

      await this.saveEntities(queryRunner, payerAccount, payeeAccount, transaction);

      await queryRunner.commitTransaction();

      const eventName = TransactionEventsTypesEnum.TRANSACTION;
      this.sendTransactionUpdateEvent(payeeAccount, transaction, eventName);

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

  private validateAccounts(payerAccount: Account, payeeAccount: Account, amount: number): void {
    if (payerAccount.id === payeeAccount.id) {
      throw new BadRequestException('Payer and payee accounts are the same.');
    }

    if (payerAccount.balance < amount) {
      throw new BadRequestException('Insufficient funds in payer account.');
    }
  }

  private updateBalances(payerAccount: Account, payeeAccount: Account, amount: number): void {
    payerAccount.withdraw(amount);
    payeeAccount.deposit(amount);
  }

  async sendTransactionUpdateEvent(payeeAccount: Account, transaction: Transaction, eventName: TransactionEventsTypesEnum) {
    type transactionEventData = { account: Account, transaction: Transaction, payerName: string };
    const payerName = (await this.userRepository.getNameById(payeeAccount.userId)).name
    this.eventsGateway.sendEventToUser(payeeAccount.userId, { transaction: transaction, payerName: payerName } as transactionEventData, eventName);
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
