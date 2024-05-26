import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "../service/user.service";

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
}