import { Test, TestingModule } from '@nestjs/testing';
import { DbaseController } from './dbase.controller';

describe('DbaseController', () => {
  let controller: DbaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbaseController],
    }).compile();

    controller = module.get<DbaseController>(DbaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
