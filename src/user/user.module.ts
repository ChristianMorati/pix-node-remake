import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { UsersService } from './service/user.service';
import { UserController } from './controller/user-controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [
        UserController
    ],
    providers: [
        UsersService,
        UserRepository,
    ],
    exports: [UserRepository]
})
export class UserModule { }
