import { BadRequestException, Body, Controller, Get, HttpStatus, InternalServerErrorException, Param, ParseIntPipe, Post, Res } from "@nestjs/common";
import { AccountService } from "../service/account-service";
import { CreateAccountDto } from "../dto/create-account-dto";
import { Response } from "express";
import { DepositAccountDto } from "../dto/deposit-account.dto";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { NumericIdPipe } from "src/pipes/numeric-id.pipe";
import { GetAccountByPixKeyDto } from "../dto/get-account-by-pix-key.dto";

@ApiTags('account')
@Controller('account')
export class AccountController {
    constructor(
        private accountService: AccountService,
    ) { }

    @Get(':id')
    @ApiOperation({ summary: 'Get account by ID' })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The unique identifier of the account',
        example: '123',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved the account',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid ID or other error',
    })
    async getAccount(
        @Param('id', NumericIdPipe) id: number,
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.getAccountById(id);
            res.status(HttpStatus.OK).json(account);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).send();
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get account by User ID' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: 'The unique identifier of the user',
        example: '456',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved the account associated with the user',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid User ID or other error',
    })
    async getAccountByUserId(
        @Param('userId', NumericIdPipe) userId: number,
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.getAccountByUserId(userId)
            res.status(HttpStatus.OK).json(account);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }

    @Post('pixkey')
    @ApiOperation({ summary: 'Get account by Pix key' })
    @ApiParam({
        name: 'pixKey',
        type: GetAccountByPixKeyDto,
        required: true,
        description: 'The Pix key associated with the account',
    })
    @ApiResponse({
        status: 200,
        description: 'The account associated with the provided Pix key',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid Pix key or other error',
    })
    async getAccountByPixKey(
        @Body() dto: GetAccountByPixKeyDto,
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.getAccountByPixKey(dto)
            res.status(HttpStatus.OK).json(account);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }

    @Post('deposit')
    @ApiOperation({ summary: 'Deposit an amount into an account' })
    @ApiBody({ type: DepositAccountDto })
    @ApiResponse({
        status: 200,
        description: 'Successfully deposited the amount',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid data or other error',
    })
    async deposit(
        @Body() dto: DepositAccountDto,
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.deposit(dto);
            res.status(HttpStatus.OK).json(account);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error).send();
            }
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all accounts' })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved all accounts',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to an error',
    })
    async all(
        @Res() res: Response
    ) {
        try {
            const accounts = await this.accountService.all();
            res.status(HttpStatus.OK).json(accounts);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }

    @Post()
    @ApiOperation({ summary: 'Create a new account' })
    @ApiBody({ type: CreateAccountDto })
    @ApiResponse({
        status: 201,
        description: 'Successfully created a new account',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid data or other error',
    })
    async createAccount(
        @Body() createAccountDto: CreateAccountDto,
        @Res() res: Response
    ) {
        try {
            const account = await this.accountService.saveAccount(createAccountDto);
            res.status(HttpStatus.CREATED).json(account);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }
}