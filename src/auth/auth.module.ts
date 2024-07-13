import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UsersService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        UserModule,
    ],
    controllers: [AuthController],
    providers: [
        UserRepository,
        UsersService,
        AuthService,
        JwtService,
    ],
})
export class AuthModule { }
