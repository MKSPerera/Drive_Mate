import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' }, 
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', admin);

  // Add a test job
  const job = await prisma.job.create({
    data: {
      clientName: 'Test Client',
      nationality: 'US',
      numberOfPassengers: 2,
      pickupLocation: 'Airport',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-03-25'),
      pickupTime: new Date('2024-03-20T10:00:00Z'),
      distance: 50,
      paymentAmount: 500,
      additionalDetails: 'Test job',
      currentState: 'PENDING',
    },
  });

  console.log('Test job created:', job);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });