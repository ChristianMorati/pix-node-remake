import { PartialType } from '@nestjs/swagger';
import { CreatePixKeyDto } from './create-pix-key.dto';

export class UpdatePixKeyDto extends PartialType(CreatePixKeyDto) {}
