import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto-js';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { jwtConstants } from '../constants';
import { UserRepository } from 'src/user/user.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityNotFoundError } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';
import { PixKey } from 'src/pix-key/entities/pix-key.entity';

type Payload = {
    sub: number,
    username: string
}

@Injectable()
export class AuthService {
    private readonly key: string = process.env.ENCRYPTION_KEY;

    constructor(
        private jwtService: JwtService,
        private usersRepository: UserRepository,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    private encryptToken(token: string) {
        const rt_encripted = crypto.AES.encrypt(token, this.key);
        return rt_encripted.toString();
    }

    private decryptToken(encryptedToken: string) {
        const bytes = crypto.AES.decrypt(encryptedToken, this.key);
        const decrypted = bytes.toString(crypto.enc.Utf8);
        return decrypted.toString();
    }

    private async hashPassword(password: string) {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    private async compareHashPassword(password: string, hashedPassword: string) {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    }

    async genRefreshToken(payload: Object): Promise<string> {
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: jwtConstants.rtExpiresIn,
            secret: jwtConstants.secret,
        });
        return refreshToken;
    }

    async genAccessToken(payload: Object): Promise<string> {
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: jwtConstants.expiresIn,
            secret: jwtConstants.secret,
        });
        return refreshToken;
    }

    async validateUser(payload: any) {
        const { username } = payload;

        // Verifica se o usuário existe no banco de dados
        const user = await this.usersRepository.findOneByUsername(username);

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        // Aqui você pode adicionar lógica adicional para verificar se o usuário está ativo, etc.

        return user; // Retorna o usuário autenticado
    }

    /**
    * Login User and generates a tokens.
    */
    async signin(username: string, userPassword: string):
        Promise<{ access_token: string, refresh_token: string, user: Pick<User, 'username' | 'name' | 'id'> }> {
        var userSignin = await this.usersRepository.findOneByUsername(username);

        if (!userSignin) {
            throw new UnauthorizedException();
        }
        if (!await this.compareHashPassword(userPassword, userSignin.password)) {
            throw new UnauthorizedException();
        }

        if (userSignin.cpf) {
            userSignin.cpf = this.decryptToken(userSignin.cpf)
        };

        const tokens = await this.genTokens(userSignin.id, userSignin.username);

        const { password, ...user } = userSignin;
        return { user, ...tokens };
    }

    async cpfAlreadyExists(cpf: string) {
        try {
            await this.usersRepository.findOneByCpf(cpf);
            throw new BadRequestException(`user with cpf: ${cpf} already exists`);
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return null;
            }
            throw e;
        }
    }

    async emailAlreadyExists(email: string) {
        try {
            await this.usersRepository.findOneByUsername(email);
            throw new BadRequestException(`user with email: ${email} already exists`);
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return null;
            }
            throw e;
        }
    }

    /**
    * Create an User and generates a tokens.
    */
    async signUp(createUserDto: CreateUserDto):
        Promise<{ access_token: string, refresh_token: string, user: Pick<User, 'username' | 'name' | 'id'> }> {

        const queryRunner = this.entityManager.connection.createQueryRunner();
        try {
            await queryRunner.startTransaction();

            await this.emailAlreadyExists(createUserDto.username);

            createUserDto.password = await this.hashPassword(createUserDto.password);
            var rawCpf = createUserDto.cpf;

            if (rawCpf !== undefined) {
                await this.cpfAlreadyExists(rawCpf);
            }

            let createdUser: User = await this.usersRepository.save(createUserDto);

            if (!createdUser.id) { throw Error('Error to save user'); }

            //Create account for a user and set one pix key
            const account = new Account({
                userId: createdUser.id,
            })
            createdUser.account = account;

            await queryRunner.manager.save(Account, account);

            // assign keys to user account
            createdUser.account.pixKeys = []
            const emailPixKey = new PixKey({ accountId: createdUser.account.id, value: createdUser.username, type: 'email', });
            await queryRunner.manager.save(PixKey, emailPixKey);
            createdUser.account.pixKeys.push(emailPixKey);

            if (rawCpf !== undefined) {
                const cpfPixKey = new PixKey({ accountId: createdUser.account.id, type: 'cpf', value: rawCpf, });
                await queryRunner.manager.save(PixKey, cpfPixKey);
                createdUser.account.pixKeys.push(cpfPixKey);
            }

            // commit changes user and account
            await queryRunner.manager.save(User, createdUser);

            const tokens = await this.genTokens(createdUser.id, createdUser.username);
            const { password, ...user } = createdUser;

            await queryRunner.commitTransaction();
            user.account = null;
            return { user, ...tokens };
        } catch (error) {
            if (queryRunner.isTransactionActive) { await queryRunner.rollbackTransaction(); }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async genTokens(sub: number, username: string) {
        const accessToken = await this.genAccessToken({ sub: sub, username: username });
        const refreshToken = await this.genRefreshToken({ sub: sub, username: username });

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    /**
    * Generate new tokens based on the integrity of the Access Token.
    * @returns {accessToken: string, refresh_token: string} Especifc Transaction.
    */
    async validateRefreshToken(access_token: string, refresh_token: string)
        : Promise<{ access_token: string, refresh_token: string }> {

        var payload = await this.jwtService.decode(access_token);
        var user_id = payload.sub;

        try {
            // verify access_token integrity
            await this.jwtService.verifyAsync(access_token, {
                secret: jwtConstants.secret,
                ignoreExpiration: true
            });

            const payload = await this.jwtService.verifyAsync(refresh_token, { secret: jwtConstants.secret });

            // gen new tokens
            const newPayload = { sub: user_id, username: payload.username };
            const newAccessToken = await this.genAccessToken(newPayload);
            const newRefreshToken = await this.genRefreshToken(newPayload);

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken
            };
        } catch (e) {
            // console.error('RT expired');
            throw new UnauthorizedException();
        }
    }
}