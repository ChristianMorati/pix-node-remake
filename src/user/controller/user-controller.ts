import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../service/user.service';
import { z } from 'zod';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(
        private userService: UsersService,
    ) { }

    @Get(':id')
    async getUser(@Param() param: any) {
        const { id } = param;
        const user = await this.userService.getFullData(id);
        return user;
    }

    @Post('pixKey')
    async getUserByPixKey(@Body() body: any, @Res() res: Response) {
        try {
            const pixKeySchema = z.object({
                pixKey: z.string().min(8),
                type: z.string().min(3),
            });

            const result = pixKeySchema.safeParse(body);
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }

            const { pixKey, type } = result.data;

            const name = await this.userService.getUserByPixKey(pixKey, type);
            if (!name) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }

            return res.status(HttpStatus.OK).json({ name }).send();
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message }).send();
        }
    }
}