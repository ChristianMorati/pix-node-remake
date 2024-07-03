import { ApiProperty } from "@nestjs/swagger";
import { PixKeyType } from "../enum/pix-key-type.enum";
import { IsBoolean, IsEnum, IsString } from "class-validator";

export class CreatePixKeyDto {
    @ApiProperty({
        description: "The account ID associated with the Pix key",
        example: 1,
    })
    accountId: number;

    @ApiProperty({
        description: "The type of the Pix key (e.g., EMAIL, PHONE, CPF, etc.)",
        enum: PixKeyType,
        example: PixKeyType.EMAIL,
    })
    @IsEnum(PixKeyType)
    type: PixKeyType;

    @ApiProperty({
        description: "The value of the Pix key, which depends on the chosen type",
        example: "example@gmail.com",
    })
    @IsString()
    value: string;

    @ApiProperty({ description: "Whether the Pix key is currently active or not" })
    @IsBoolean()
    is_active: boolean;
}