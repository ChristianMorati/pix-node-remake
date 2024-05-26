import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { AccountModule } from './account/account.module';
import { Account } from './account/entities/account.entity';
import { PixKeyModule } from './pix-key/pix-key.module';
import { PixKey } from './pix-key/entities/pix-key.entity';
import { TransactionModule } from './transaction/transaction.module';
import { Transaction } from './transaction/entities/transaction.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        User,
        Account,
        Transaction,
        PixKey,
      ],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    PaymentModule,
    AccountModule,
    TransactionModule,
    PixKeyModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
