import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from './firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  providers: [FirebaseService, NotificationService],
  exports: [FirebaseService, NotificationService],
})
export class NotificationsModule {}

// Export both module names
export { NotificationsModule as NotificationModule };
