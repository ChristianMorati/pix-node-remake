import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Response } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Res() res: Response,
  ) {
    try {
      const transaction = await this.transactionService.create(createTransactionDto);
      if (!transaction) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.status(HttpStatus.CREATED).json(transaction);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
    }
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}
