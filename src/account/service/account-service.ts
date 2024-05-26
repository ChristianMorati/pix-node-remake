import { AccountRepository } from "../account.repository";
import { UserRepository } from "src/user/user.repository";
import { Account } from "../entities/account.entity";
import { CreateAccountDto } from "../dto/create-account-dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountService {
    constructor(
        private accountRepository: AccountRepository,
        private userRepository: UserRepository,
    ) { }

    async getAccountById(id: number) {
        const account = await this.accountRepository.findOne(id);
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

            const updatedUserAccount = await this.userRepository.save(user);
            return updatedUserAccount;
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }
    }
}
