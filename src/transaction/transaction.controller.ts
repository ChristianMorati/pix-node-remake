import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionDto } from './dto/transaction.dto';
import { NumericIdPipe } from 'src/pipes/numeric-id.pipe';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  @ApiOperation({ summary: 'Update account balances and record a transaction object' })
  @ApiBody({ type: CreateTransactionDto, required: true })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Res() res: Response,
  ) {
    try {
      const transaction = await this.transactionService.create(createTransactionDto);
      if (!transaction.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Failed to create transaction',
        });
      }

      return res.status(HttpStatus.CREATED).json(transaction);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  @Post('refund')
  @ApiOperation({ summary: 'Refund amount to origin account and update transaction type to refund' })
  @ApiBody({ type: TransactionDto, required: true })
  async refund(
    @Body() refundTransactionDto: TransactionDto,
    @Res() res: Response,
  ) {
    try {
      const transaction = await this.transactionService.refund(refundTransactionDto);
      if (!transaction.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Failed to refund',
        });
      }

      return res.status(HttpStatus.CREATED).json(transaction);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  @Get('all/:accountId')
  @ApiOperation({ summary: 'Get all transactions of especific account' })
  async findAllByAccountId(
    @Param('accountId', NumericIdPipe) accountId: number,
    @Res() res: Response,
  ) {
    try {
      const transactions = await this.transactionService.findAllByAccountId(accountId);
      if (!transactions) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }
      res.status(HttpStatus.OK).json(transactions);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(
    @Param('id', NumericIdPipe) id: number) {
    return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction by ID' })
  @ApiBody({ type: UpdateTransactionDto, required: true })
  update(@Param('id', NumericIdPipe) id: number, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(+id, updateTransactionDto);
  }

  @ApiOperation({ summary: 'Delete transaction by ID' })
  @Delete(':id')
  remove(@Param('id', NumericIdPipe) id: number) {
    return this.transactionService.remove(+id);
  }
}
