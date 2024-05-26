import { IsEmail, IsString, MinLength } from "class-validator"


export class CreateUserDto {
    @IsString()
    name: string

    @IsEmail()
    username: string

    @MinLength(8)
    @IsString()
    password: string

    @MinLength(11)
    @IsString()
    cpf?: string
}