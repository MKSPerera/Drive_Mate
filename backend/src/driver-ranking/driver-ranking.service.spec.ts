import { Test, TestingModule } from '@nestjs/testing';
import { DriverRankingService } from './driver-ranking.service';

describe('DriverRankingService', () => {
  let service: DriverRankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverRankingService],
    }).compile();

    service = module.get<DriverRankingService>(DriverRankingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
