import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { cnpjGenerate } from '@saas/utils'

const prisma = new PrismaClient()

async function seed() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
  await prisma.eventVirtualAccount.deleteMany()

  const passwordHash = await hash('Biel@2000_', 6)

  const user = await prisma.user.create({
    data: {
      name: 'Gabriel Borges Oliveira',
      email: 'gabriel.vscode@gmail.com',
      avatarUrl: 'https://github.com/GabrielBorges2000.png',
      passwordHash,
    },
  })

  const anotherUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  const anotherUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      passwordHash,
    },
  })

  async function createVirtualAccount() {
    return await prisma.eventVirtualAccount.create({
      data: {
        balance: faker.finance.amount()
      },
    })
  }

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      cnpj: cnpjGenerate(),
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      events: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: faker.helpers.arrayElements(["CREDIT", 'DEBIT', "PIX", "TICKET"]),
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"]),

            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Billing)',
      cnpj: cnpjGenerate(),
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
      events: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'BILLING',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      cnpj: cnpjGenerate(),
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: user.id,
      events: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
              virtualAccountId: (await createVirtualAccount()).id,
              ageRestriction: 0,
              capacity: faker.number.int({ min: 100, max: 1000 }),
              isOnline: true,
              paymentMethod: ["CREDIT", 'DEBIT', "PIX", "TICKET"],
              status: faker.helpers.arrayElement(["ACTIVE", "PENDING", "FINISHED", "CANCELED"])
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })
}

seed().then(() => {
  console.log('Database seeded!')
})