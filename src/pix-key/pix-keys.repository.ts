import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PixKey } from 'src/pix-key/entities/pix-key.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PixKeyRepository {
    constructor(
        @InjectRepository(PixKey)
        private pixKeysRepository: Repository<PixKey>,
    ) { }

    async save(pixKey: any): Promise<PixKey | undefined> {
        return await this.pixKeysRepository.save(pixKey);
    }

    async findOne(id: number): Promise<PixKey | undefined> {
        return await this.pixKeysRepository.findOneBy({ id });
    }

    async findAllByAccountId(accountId: number): Promise<PixKey[] | undefined> {
        const pixKeys: PixKey[] | null = await this.pixKeysRepository.find({ where: { accountId } });
        return pixKeys;
    }

    async findPixKeyByAccountIdAndByType(accountId: number, type: string): Promise<PixKey | null> {
        const pixKey: PixKey = await this.pixKeysRepository.findOne({
            where: { accountId, type }
        });
        return pixKey;
    }

    async findAll(): Promise<PixKey[] | undefined> {
        return await this.pixKeysRepository.find();
    }

    async delete(id: number) {
        return await this.pixKeysRepository.delete(id);
    }
}