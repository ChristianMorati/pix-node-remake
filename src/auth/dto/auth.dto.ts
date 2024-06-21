import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNumber, IsString, MinLength } from "class-validator"


export class AT {
    @IsString()
    sub: number

    @IsEmail()
    username: string

    @IsNumber()
    iat: number

    @IsNumber()
    exp: number
}


export class AuthDto {
    @ApiProperty({ description: 'The user email' })
    @MinLength(6)
    @IsEmail()
    username: string

    @ApiProperty({ description: 'User password' })
    @IsString()
    @MinLength(6)
    password: string
}