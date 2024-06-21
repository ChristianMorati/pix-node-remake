import { ApiProperty } from "@nestjs/swagger";

export class UpdateTokensDto {
    @ApiProperty({ description: 'The user access token' })
    access_token: string;

    @ApiProperty({ description: 'The user refresh token' })
    refresh_token: string;
}
