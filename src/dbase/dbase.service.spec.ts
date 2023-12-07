import { Test, TestingModule } from '@nestjs/testing';
import { DbaseService } from './dbase.service';

describe('DbaseService', () => {
  let service: DbaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbaseService],
    }).compile();

    service = module.get<DbaseService>(DbaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
