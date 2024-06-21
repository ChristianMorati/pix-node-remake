import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'The full name of the user',
        example: 'John Doe'
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'johndoe@example.com'
    })
    @IsEmail()
    username: string;

    @ApiProperty({
        description: 'The password for the user account. Must be at least 6 characters long.',
        example: 'securePassword123'
    })
    @MinLength(6)
    @IsString()
    password: string;

    @ApiPropertyOptional({
        description: 'The CPF (Cadastro de Pessoas Físicas) of the user. Must be at least 11 characters long.',
        example: '12345678901'
    })
    @MinLength(11)
    @IsString()
    cpf?: string;
}
