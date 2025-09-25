import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.campaign.deleteMany();

  const users = await prisma.$transaction(
    Array.from({ length: 5 }).map((_, index) =>
      prisma.user.create({
        data: {
          name: `Agente ${index + 1}`,
          email: `agent${index + 1}@leadbox.ai`,
          role: index === 0 ? 'Admin' : 'Agent'
        }
      })
    )
  );

  await prisma.contact.create({
    data: {
      name: 'María López',
      phone_e164: '+521234567890',
      locale: 'es',
      country: 'MX',
      tags: ['becas'],
      consent: { whatsapp: true },
      leads: {
        create: {
          ownerId: users[1].id,
          status: 'Nuevo',
          score: 78
        }
      }
    }
  });

  await prisma.campaign.create({
    data: {
      name: 'Becas Primavera',
      status: 'draft',
      stats: { delivered: 0, read: 0, replied: 0, converted: 0 }
    }
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
