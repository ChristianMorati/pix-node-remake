import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto-js';

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { jwtConstants } from '../constants';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
    private readonly key: string = process.env.ENCRYPTION_KEY;

    constructor(
        private jwtService: JwtService,
        private usersRepository: UserRepository,
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

    /**
    * Login User and generates a tokens.
    * @returns {
    * accessToken: string,
    * refresh_token: string,
    * user: Pick<User, 'username' | 'name' | 'id' | 'cpf'>;} User and Tokens.
    */
    async signin(username: string, userPassword: string): Promise<Object> {
        const user = await this.usersRepository.findOneByUsername(username);

        if (!user) {
            throw new UnauthorizedException();
        }
        if (!await this.compareHashPassword(userPassword, user.password)) {
            throw new UnauthorizedException();
        }

        const payload = { sub: user.id, username: user.username };
        const accessToken = await this.genAccessToken(payload);
        const refreshToken = await this.genRefreshToken(payload);

        if (user.cpf) {
            user.cpf = this.decryptToken(user.cpf)
        };

        const { password, ...signedUser } = user;
        return { user: { ...signedUser }, access_token: accessToken, refresh_token: refreshToken };
    }

    /**
    * Save an User and generates a tokens.
    * @returns {
    * accessToken: string,
    * refresh_token: string,
    * user: Pick<User, 'username' | 'name' | 'id' | 'cpf'>;} User and Tokens.
    */
    async signUp(createUserDto: CreateUserDto):
        Promise<{ access_token: string, refresh_token: string, user: Pick<User, 'username' | 'name' | 'id'> }> {
        try {
            createUserDto.password = await this.hashPassword(createUserDto.password);
            var rawCpf = createUserDto.cpf;

            if (rawCpf !== undefined) createUserDto.cpf = this.encryptToken(createUserDto.cpf);

            let createdUser: User = await this.usersRepository.save(createUserDto);

            if (!createdUser) { throw Error('Error to save user'); }

            const payload = {
                sub: createdUser.id,
                username: createdUser.username,
            }

            const accessToken = await this.genAccessToken(payload);
            const refreshToken = await this.genRefreshToken(payload);

            createdUser.cpf = rawCpf;

            const { password, ...user } = createdUser;

            return { user: { ...user }, access_token: accessToken, refresh_token: refreshToken };
        } catch (error) {
            throw error;
        }
    }

    /**
    * Generate new tokens based on the integrity of the Access Token.
    * @returns {accessToken: string, refresh_token: string} Especifc Transaction.
    */
    async validateRefreshToken(access_token: string, refresh_token: string)
        : Promise<{ access_token: string, refresh_token: string }> {

        var payload = await this.jwtService.decode(access_token);
        var user_id = payload.sub;

        console.error(refresh_token, access_token)

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