import { Test, TestingModule } from '@nestjs/testing';
import { PixKeyController } from './pix-key.controller';
import { PixKeyService } from './pix-key.service';

describe('PixKeyController', () => {
  let controller: PixKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PixKeyController],
      providers: [PixKeyService],
    }).compile();

    controller = module.get<PixKeyController>(PixKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
