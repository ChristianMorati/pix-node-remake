import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UsersService } from 'src/user/service/user.service';
import { jwtConstants } from './constants';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        UserModule,
    ],
    providers: [
        UserRepository,
        UsersService,
        AuthService,
        JwtService,
    ],
    controllers: [AuthController],
})
export class AuthModule { }
