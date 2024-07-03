import { Module } from '@nestjs/common';
import { PixKeyService } from './pix-key.service';
import { PixKeyController } from './pix-key.controller';
import { PixKeyRepository } from './pix-keys.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PixKey } from './entities/pix-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PixKey])],
  controllers: [
    PixKeyController,
  ],
  providers: [
    PixKeyService,
    PixKeyRepository
  ],
})
export class PixKeyModule { }
