import { Body, Controller, Get, HttpStatus, Param, Post, Res } from "@nestjs/common";
import { AccountService } from "../service/account-service";
import { CreateAccountDto } from "../dto/create-account-dto";
import { Response } from "express";

@Controller('account')
export class AccountController {
    constructor(
        private accountService: AccountService,
    ) { }

    @Get(':id')
    async getAccount(
        @Param() param: any,
        @Res() res: Response
    ) {
        const { id } = param;
        try {
            const account = await this.accountService.getAccountById(id)
            res.status(HttpStatus.OK).json(account);
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }
    }

    @Get('user/:userId')
    async getAccountByUserId(
        @Param() param: any,
        @Res() res: Response
    ) {
        const { userId } = param;
        try {
            const account = await this.accountService.getAccountByUserId(userId)
            res.status(HttpStatus.OK).json(account);
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }
    }

    @Get('key/:pixKey')
    async getAccountByPixKey(
        @Param() param: any,
        @Res() res: Response
    ) {
        const { pixKey } = param;
        try {
            const account = await this.accountService.getAccountByPixKey(pixKey)
            res.status(HttpStatus.OK).json(account);
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }
    }

    @Get()
    async all(
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.all()
            res.status(HttpStatus.OK).json(account);
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }
    }

    @Post()
    async createAccount(
        @Body() createAccountDto: CreateAccountDto,
        @Res() res: Response
    ) {
        try {
            const { userId, initialBalance } = createAccountDto;
            const account = await this.accountService.saveAccount({ userId, initialBalance });
            res.status(HttpStatus.CREATED).json(account);
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).send();
        }
    }
}