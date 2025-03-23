import { Test, TestingModule } from '@nestjs/testing';
import { DriverRankingController } from './driver-ranking.controller';

describe('DriverRankingController', () => {
  let controller: DriverRankingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverRankingController],
    }).compile();

    controller = module.get<DriverRankingController>(DriverRankingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
