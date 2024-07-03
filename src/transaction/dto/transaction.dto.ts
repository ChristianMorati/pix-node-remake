import { IsNotEmpty, IsNumber, IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TransactionType } from '../enum/transaction-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionDto {
    @ApiProperty({ description: 'The Transacation ID of the payer', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'The amount of the transaction', example: 4.59 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'The type of the payee Pix key', example: 'email' })
    @IsNotEmpty()
    @IsString()
    payeePixKeyType: string;

    @ApiProperty({ description: 'The user ID of the payer', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    payerUserId: number;

    @ApiPropertyOptional({ description: 'The Pix key of the payee', example: 'christiano@gmail.com' })
    @IsOptional()
    @IsString()
    payeePixKey?: string;

    @ApiProperty({ description: 'The account ID associated with the transaction', example: 13 })
    @IsNotEmpty()
    @IsNumber()
    accountId: number;

    @ApiProperty({ description: 'Indicates if the transaction was successful', example: true })
    @IsBoolean()
    success: boolean;

    @ApiProperty({ description: 'The type of the transaction', enum: TransactionType })
    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType;
}
