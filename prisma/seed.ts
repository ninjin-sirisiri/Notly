// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // デフォルト設定を作成
  await prisma.setting.upsert({
    where: { key: 'notification_enabled' },
    update: {},
    create: {
      key: 'notification_enabled',
      value: 'true',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'notification_times' },
    update: {},
    create: {
      key: 'notification_times',
      value: JSON.stringify(['09:00', '21:00']),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
