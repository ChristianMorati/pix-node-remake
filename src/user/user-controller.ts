import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './user.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NumericIdPipe } from 'src/pipes/numeric-id.pipe';
import { GetUserByPixKey } from './dto/get-user-by-pix-key.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        private userService: UsersService,
    ) { }


    @Get(':id')
    @ApiOperation({ summary: 'Get account by User ID' })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The unique identifier of the user',
        example: '1',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved the account associated with the user',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request due to invalid User ID or other error',
    })
    async getAccountByUserId(
        @Param('id', NumericIdPipe) id: number,
        @Res() res: Response
    ) {
        try {
            const user = await this.userService.getFullData(id)
            if (!user) {
                res.status(HttpStatus.BAD_REQUEST).send();
            }
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                res.status(HttpStatus.BAD_REQUEST).json(error);
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
    }

    @Post('pixKey')
    @ApiOperation({ summary: "Get a user name based in pixKey value and type" })
    @ApiBody({ type: GetUserByPixKey })
    async getUserByPixKey(@Body() dto: GetUserByPixKey, @Res() res: Response) {
        try {
            const name = await this.userService.getUserByPixKey(dto.value, dto.type);
            if (!name) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }

            return res.status(HttpStatus.OK).json({ name }).send();
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message }).send();
        }
    }
}