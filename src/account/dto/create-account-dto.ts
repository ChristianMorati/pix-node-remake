import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsPositive, Min } from "class-validator";

export class CreateAccountDto {
    @ApiPropertyOptional({
        description: 'The initial account balance | by default 0.0"',
        example: "10.20",
    })
    @IsNumber()
    @IsPositive()
    @Min(0)
    initialBalance?: number;

    @ApiProperty({
        description: 'The user ID',
        example: "1",
    })
    @IsNumber()
    @IsPositive()
    userId: number;
}