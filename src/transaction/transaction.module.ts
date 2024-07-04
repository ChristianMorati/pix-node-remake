import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AccountRepository } from 'src/account/account.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './transaction.repository';
import { EventsGateway } from 'src/sse';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, User]),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    AccountRepository,
    TransactionRepository,
    UserRepository,
    EventsGateway,
  ],
  exports: [
    EventsGateway
  ]
})
export class TransactionModule { }
