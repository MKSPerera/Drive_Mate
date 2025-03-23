import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { FirebaseModule } from 'src/notifications/firebase.module';
import { JobNotificationService } from './job-notification.service';
import { DriverRankingModule } from 'src/driver-ranking/driver-ranking.module';

@Module({
  imports: [PrismaModule, FirebaseModule, DriverRankingModule,],
  providers: [JobsService, PrismaService, JobNotificationService],
  controllers: [JobsController],
  exports: [JobsService]
})
export class JobsModule {}
