import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

export class DepositAccountDto {
    @ApiProperty({
        description: "Unique identifier of the created account",
        example: 1,
    })
    @IsInt({ message: 'Account ID must be an integer' })
    @IsPositive({ message: 'Account ID must be a positive integer' })
    accountId: number;

    @ApiProperty({
        description: "Amount to be deposited into the account",
        example: 0.50,
    })
    @IsPositive({ message: 'Amount must be a positive number' })
    @Min(0.50, { message: 'Amount must be greater than or equals 0.5' })
    amount: number;
}