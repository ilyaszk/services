import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.offer.create({
    data: {
      title: 'Translate File',
      description: 'Translate a file from French to English.',
      price: 10,
      category: 'Translation',
      image: '/file.svg',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
