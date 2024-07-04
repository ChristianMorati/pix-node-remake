import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, Min, IsEnum, IsOptional } from 'class-validator';
import { PixKeyType } from '../../pix-key/enum/pix-key-type.enum';
import { TransactionType } from '../enum/transaction-type.enum';

export class CreateTransactionDto {
    @ApiProperty({
        description: 'The amount of money to be transferred. Must be at least 0.50.',
        example: 150.50
    })
    @IsNumber()
    @Min(0.50, { message: 'Amount must be at least 0.50' })
    amount: number;

    @ApiProperty({
        description: 'The ID of the user making the payment. Must be a positive integer greater than 1.',
        example: 12345
    })
    @IsNumber()
    @Min(1, { message: 'Payer user ID must be a positive integer greater than 1' })
    payerUserId: number;

    @ApiProperty({
        description: 'The Pix key of the payee.',
        example: 'payee@example.com'
    })
    @IsString()
    payeePixKey: string;

    @ApiProperty({
        description: 'The type of the Pix key.',
        enum: PixKeyType,
        example: PixKeyType.EMAIL
    })
    @IsEnum(PixKeyType)
    payeePixKeyType: PixKeyType;

    @ApiPropertyOptional({
        description: 'Transaction type.',
        enum: TransactionType,
        example: TransactionType.TRANSACTION,
    })
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType.TRANSACTION;
}
