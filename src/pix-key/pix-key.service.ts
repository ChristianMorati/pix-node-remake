import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePixKeyDto } from './dto/create-pix-key.dto';
import { UpdatePixKeyDto } from './dto/update-pix-key.dto';
import { PixKeyRepository } from 'src/pix-key/pix-keys.repository';
import { PixKey } from './entities/pix-key.entity';

@Injectable()
export class PixKeyService {
  constructor(
    private readonly pixKeyRepository: PixKeyRepository
  ) { }

  async create(createPixKeyDto: CreatePixKeyDto) {
    try {
      console.clear();
      const { accountId, type } = createPixKeyDto;

      const existingPixKeys = await this.pixKeyRepository.findAllByAccountId(accountId);

      console.error(existingPixKeys);
      // find if key type already existis
      const samePixKeyType = existingPixKeys.find((key) => key.type == type);

      if (samePixKeyType) {
        return null;
      }

      const pixKey = await this.pixKeyRepository.save(createPixKeyDto);

      return pixKey;
    } catch (e) {
      throw e;
    }
  }

  async deactivate(accountId: number, type: string) {
    try {
      const pixKey: PixKey | null = await this.pixKeyRepository.findPixKeyByAccountIdAndByType(accountId, type);

      if (!pixKey) {
        throw NotFoundException;
      }
      
      pixKey.is_active = false;

      await this.pixKeyRepository.save(pixKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  async activate(accountId: number, type: string) {
    try {
      const pixKey: PixKey | null = await this.pixKeyRepository.findPixKeyByAccountIdAndByType(accountId, type);

      if (!pixKey) {
        throw NotFoundException;
      }
      
      pixKey.is_active = true;
      await this.pixKeyRepository.save(pixKey);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  findAll() {
    return this.pixKeyRepository.findAll();
  }

  findOne(id: number) {
    return this.pixKeyRepository.findOne(id);
  }

  update(id: number, updatePixKeyDto: UpdatePixKeyDto) {
    // logic here
    return `This action updates a #${id} pixKey`;
  }

  remove(id: number) {
    return `This action removes a #${id} pixKey`;
  }
}
