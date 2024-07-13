import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class RefundTransactionDto {
    @ApiProperty({ description: 'The Transacation ID of the payer', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
