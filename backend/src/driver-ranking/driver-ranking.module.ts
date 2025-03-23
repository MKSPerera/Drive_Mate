import { Module } from '@nestjs/common';
import { DriverRankingService } from './driver-ranking.service';
import { DriverRankingController } from './driver-ranking.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverRankingController],
  providers: [DriverRankingService],
  exports: [DriverRankingService]
})
export class DriverRankingModule {}
