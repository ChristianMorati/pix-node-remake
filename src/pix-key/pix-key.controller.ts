import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { PixKeyService } from './pix-key.service';
import { CreatePixKeyDto } from './dto/create-pix-key.dto';
import { UpdatePixKeyDto } from './dto/update-pix-key.dto';
import { Response } from 'express';
import { TogglePixKeyDto } from './dto/toggle-pix-key.dto';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PixKeyType } from './enum/pix-key-type.enum';
import { NumericIdPipe } from 'src/pipes/numeric-id.pipe';

@ApiTags('pix key')
@Controller('pix-key')
export class PixKeyController {
  constructor(private readonly pixKeyService: PixKeyService) { }

  @Post()
  @ApiBody({
    type: CreatePixKeyDto
  })
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

  @ApiParam({
    name: 'type',
    type: 'string',
    enum: PixKeyType,
    description: 'The type of the Pix key to deactivate (e.g., EMAIL, PHONE, CPF).',
    allowEmptyValue: false,
    required: true,
  })
  @ApiParam({
    name: 'accountId',
    type: 'number',
    allowEmptyValue: false,
    description: 'The numerical ID of the account associated with the Pix key.',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Pix key deactivated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., invalid parameters).' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @Post('deactivate/:type/:accountId')
  async deactivate(
    @Param() dto: TogglePixKeyDto,
    @Res() res: Response) {
    try {
      const { type, accountId } = dto;
      const response = await this.pixKeyService.deactivate(accountId, type);
      if (!response) {
        res.status(HttpStatus.BAD_REQUEST).send();
      }

      res.status(HttpStatus.OK).send();
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @ApiParam({
    name: 'type',
    type: 'string',
    enum: PixKeyType,
    description: 'The type of the Pix key to activate (e.g., EMAIL, PHONE, CPF).',
    allowEmptyValue: false,
    required: true,
  })
  @ApiParam({
    name: 'accountId',
    type: 'number',
    description: 'The numerical ID of the account associated with the Pix key.',
    allowEmptyValue: false,
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Pix key deactivated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., invalid parameters).' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  findOne(@Param('id', NumericIdPipe) id: string) {
    return this.pixKeyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', NumericIdPipe) id: string, @Body() updatePixKeyDto: UpdatePixKeyDto) {
    return this.pixKeyService.update(+id, updatePixKeyDto);
  }

  @Delete(':id')
  remove(@Param('id', NumericIdPipe) id: string) {
    return this.pixKeyService.remove(+id);
  }
}
