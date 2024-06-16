import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Put, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from '../dto/auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from '../service/auth.service';
import { UpdateTokensDto } from '../dto/update-tokens.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() authDto: AuthDto,
        @Res() res: Response,
    ) {
        try {
            const result = await this.authService.signin(authDto.username, authDto.password);
            if (!result.user) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }

            res.cookie('token', result.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 3600000, // 1 hour
            });

            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }


    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response) {
        try {
            const user = await this.authService.signUp(createUserDto);
            res.status(HttpStatus.CREATED).json(user).send();
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Error creating user' },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put('refresh')
    async refresh(
        @Body() body: UpdateTokensDto,
        @Res() res: Response) {

        const { access_token, refresh_token } = body
        var newAcessToken;
        try {
            newAcessToken = await this.authService.validateRefreshToken(access_token, refresh_token);
            res.status(HttpStatus.CREATED).json(newAcessToken).send();
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}