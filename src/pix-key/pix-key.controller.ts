import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { PixKeyService } from './pix-key.service';
import { CreatePixKeyDto } from './dto/create-pix-key.dto';
import { UpdatePixKeyDto } from './dto/update-pix-key.dto';
import { Response } from 'express';
import { TogglePixKeyDto } from './dto/toggle-pix-key.dto';

@Controller('pix-key')
export class PixKeyController {
  constructor(private readonly pixKeyService: PixKeyService) { }

  @Post()
  async create(@Body() createPixKeyDto: CreatePixKeyDto,
    @Res() res: Response) {
    try {
      const pixKey = await this.pixKeyService.create(createPixKeyDto);
      if (!pixKey) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.json(pixKey);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('deactivate/:type/:accountId')
  async deactivate(
    @Param() params: TogglePixKeyDto,
    @Res() res: Response) {
    try {
      const { type, accountId } = params;
      const response = await this.pixKeyService.deactivate(accountId, type);
      if (!response) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.status(HttpStatus.OK).send();
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('activate/:type/:accountId')
  async activate(
    @Param() params: TogglePixKeyDto,
    @Res() res: Response) {
    try {
      const { type, accountId } = params;
      const response = await this.pixKeyService.deactivate(accountId, type);
      if (!response) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.status(HttpStatus.OK).send();
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get()
  findAll() {
    return this.pixKeyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pixKeyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePixKeyDto: UpdatePixKeyDto) {
    return this.pixKeyService.update(+id, updatePixKeyDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {

    const x = {
      "accountId": 1,
      "type": "cpf"
    }
    return this.pixKeyService.remove(+id);
  }
}
