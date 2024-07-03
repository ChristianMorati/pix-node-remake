import { ApiProperty } from "@nestjs/swagger";
import { IsBase64, IsJWT } from "class-validator";

export class UpdateTokensDto {
    @ApiProperty({
        description: 'The user access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiY2hyaXN0aWFuQGdtYWlsLmNvbSIsImlhdCI6MTcxODk4MDAwMiwiZXhwIjoxNzE4OTgwMDYyfQ.rxRsRUDZptfUxFgWXFFm1ROQBRLNKAe7jM0HdXLUPG4'
    })
    @IsJWT()
    access_token: string;

    @ApiProperty({
        description: 'The user refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiY2hyaXN0aWFuQGdtYWlsLmNvbSIsImlhdCI6MTcxODk4MDAwMiwiZXhwIjoxNzE4OTgwMDYyfQ.rxRsRUDZptfUxFgWXFFm1ROQBRLNKAe7jM0HdXLUPG4'
    })
    @IsJWT()
    refresh_token: string;
}
