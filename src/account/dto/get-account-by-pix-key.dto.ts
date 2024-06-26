import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PixKeyType } from 'src/pix-key/enum/pix-key-type.enum';

export class GetAccountByPixKeyDto {
    @ApiProperty({
        description: 'Pix key of the payee (email, CPF, phone, etc.)',
        example: 'user@example.com',
    })
    @IsNotEmpty()
    @IsString()
    value: string;

    @ApiProperty({
        description: 'Type of the Pix key',
        enum: PixKeyType,
        example: PixKeyType.EMAIL,
    })
    @IsEnum(PixKeyType)
    type: PixKeyType;
}