import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Account } from 'src/account/entities/account.entity';
import { AccountRepository } from './account.repository';
import { AccountService } from './service/account-service';
import { UserRepository } from 'src/user/user.repository';
import { AccountController } from './controller/account-controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account, User]),
    ],
    controllers: [
        AccountController
    ],
    providers: [
        AccountRepository,
        AccountService,
        UserRepository
    ],
    exports: [AccountRepository]
})
export class AccountModule { }
