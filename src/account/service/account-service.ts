import { AccountRepository } from "../account.repository";
import { UserRepository } from "src/user/user.repository";
import { Account } from "../entities/account.entity";
import { CreateAccountDto } from "../dto/create-account-dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { DepositAccountDto } from "../dto/deposit-account.dto";

@Injectable()
export class AccountService {
    constructor(
        private accountRepository: AccountRepository,
        private userRepository: UserRepository,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAccountById(id: number) {
        const account = await this.accountRepository.findOne(id);
        return account;
    }

    async getAccountByPixKey(pixKey: string) {
        const account = await this.accountRepository.findOneByPixKey(pixKey);
        return account;
    }

    async getAccountByUserId(id: number) {
        const account = await this.accountRepository.findOneByUserId(id);
        return account;
    }

    async all() {
        const accounts = await this.accountRepository.findAll();
        return accounts;
    }

    async addBalance(accountId: number, amount: number) {
        try {
            const accountToAddBalance = await this.getAccountById(accountId);
            if (!accountToAddBalance) {
                throw new NotFoundException();
            }
            accountToAddBalance.deposit(amount);
            return accountToAddBalance;
        } catch (error) {
            throw error;
        }
    }

    async deposit(dto: DepositAccountDto) {
        const queryRunner = this.entityManager.connection.createQueryRunner();
        const {accountId, amount} = dto;
        try {
            await queryRunner.startTransaction();
            const account = await this.addBalance(accountId, amount);

            const transaction: Transaction = new Transaction({
                accountId: account.id,
                amount,
                payerUserId: account.userId,
                payeePixKey: null,
                success: true,
                date: new Date(),
            })

            await queryRunner.manager.save(Account, account);
            await queryRunner.manager.save(Transaction, transaction);

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

    async saveAccount(createAccountDto: CreateAccountDto) {
        try {
            const { userId, initialBalance } = createAccountDto;

            const user = await this.userRepository.findOne(userId);

            if (!user) {
                throw new Error('User not found');
            }

            const existingAccount = await this.accountRepository.findOneByUserId(user.id);

            if (existingAccount) {
                throw new Error('Account already exists for this user');
            }

            const account = new Account({ balance: initialBalance, userId: user.id });
            const createdAccount = await this.accountRepository.save(account);

            user.account = createdAccount;

            const updatedAccount = await this.userRepository.save(user);
            return updatedAccount;
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }
    }
}
