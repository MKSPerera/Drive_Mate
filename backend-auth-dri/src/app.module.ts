import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DriverModule } from './driver/driver.module';
import { JobsModule } from './jobs/jobs.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule,JobsModule, DriverModule, ConfigModule.forRoot({ isGlobal: true})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
