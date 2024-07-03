import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { PixKeyType } from "src/pix-key/enum/pix-key-type.enum";

export class GetUserByPixKey {
    @ApiProperty({
        description: 'the value of pix key',
        example: 'example@domain.com',
    })
    @IsString()
    @IsNotEmpty()
    value: string;

    @ApiProperty({
        description: 'the type of pix key',
        enum: PixKeyType,
        example: PixKeyType.EMAIL,
    })
    @IsEnum(PixKeyType)
    type: PixKeyType;
}