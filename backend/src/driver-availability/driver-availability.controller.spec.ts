import { Test, TestingModule } from '@nestjs/testing';
import { DriverAvailabilityController } from './driver-availability.controller';

describe('DriverAvailabilityController', () => {
  let controller: DriverAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverAvailabilityController],
    }).compile();

    controller = module.get<DriverAvailabilityController>(DriverAvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
