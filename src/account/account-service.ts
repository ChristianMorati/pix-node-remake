import { AccountRepository } from "./account.repository";
import { UserRepository } from "src/user/user.repository";
import { Account } from "./entities/account.entity";
import { CreateAccountDto } from "./dto/create-account-dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, EntityNotFoundError } from "typeorm";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { DepositAccountDto } from "./dto/deposit-account.dto";
import { GetAccountByPixKeyDto } from "./dto/get-account-by-pix-key.dto";
import { TransactionType } from "src/transaction/enum/transaction-type.enum";

@Injectable()
export class AccountService {
    constructor(
        private accountRepository: AccountRepository,
        private userRepository: UserRepository,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAccountById(id: number) {
        try {
            const account = await this.accountRepository.findOne(id);
            return account;
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw new BadRequestException(`Account with id: ${id} not founded`);
            }

            throw error;
        }
    }

    async getAccountByPixKey(dto: GetAccountByPixKeyDto) {
        try {
            const account = await this.accountRepository.findOneByPixKey(dto);
            return account;
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw new BadRequestException(`Account with pixKey: ${JSON.stringify(dto)} not founded`);
            }

            throw error;
        }
    }

    async getAccountByUserId(id: number) {
        try {
            const account = await  this.accountRepository.findOneByUserId(id);
            return account;
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw new BadRequestException(`Account with userId: ${id} not founded`);
            }
            
            throw error;
        }
    }

    async all() {
        const accounts = await this.accountRepository.findAll();
        return accounts;
    }

    async addBalance(accountId: number, amount: number) {
        try {
            const accountToAddBalance = await this.accountRepository.findOne(accountId);
            if (!accountToAddBalance) {
                throw new BadRequestException('Account not found');
            }
            accountToAddBalance.deposit(amount);
            return accountToAddBalance;
        } catch (error) {
            throw error;
        }
    }

    async deposit(dto: DepositAccountDto) {
        const queryRunner = this.entityManager.connection.createQueryRunner();
        const { accountId, amount } = dto;
        try {
            await queryRunner.startTransaction();
            const account = await this.addBalance(accountId, amount);

            const transaction: Transaction = new Transaction({
                accountId: account.id,
                amount,
                payerUserId: account.userId,
                payeePixKey: null,
                payeePixKeyType: null,
                success: true,
                type: TransactionType.DEPOSIT,
                date: new Date(),
            })

            await queryRunner.manager.save(Account, account);
            await queryRunner.manager.save(Transaction, transaction);

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

    async saveAccount(createAccountDto: CreateAccountDto) {
        const { userId, initialBalance } = createAccountDto;

        try {
            const user = await this.userRepository.findOne(userId);

            if (!user) {
                throw new BadRequestException('User not found');
            }

            const existingAccount = await this.accountRepository.findOneByUserId(user.id);

            if (existingAccount) {
                throw new BadRequestException('Account already exists for this user');
            }

            const account = new Account({ balance: initialBalance, userId: user.id });
            const createdAccount = await this.accountRepository.save(account);

            user.account = createdAccount;
            const updatedAccount = await this.userRepository.save(user);
            return updatedAccount;
        } catch (error) {
            throw error;
        }
    }
}
