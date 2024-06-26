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
    @ApiProperty({
        description: 'The user email',
        example: "johndoe@example.com",
    })
    @MinLength(6)
    @IsEmail()
    username: string

    @ApiProperty({
        description: 'User password',
        example: 'securePassword123',
    })
    @IsString()
    @MinLength(6)
    password: string
}