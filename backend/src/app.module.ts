// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { AppService } from './app.service';
import { DriverModule } from './driver/driver.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),
    DriverModule,
    PrismaModule,
    AdminModule,
    AuthModule,
    JobsModule,
    CalendarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}