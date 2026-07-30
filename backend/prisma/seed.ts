import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@traction.app';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`User ${email} already exists. Updating role to SUPER_ADMIN.`);
    await prisma.user.update({ where: { email }, data: { role: UserRole.SUPER_ADMIN } });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      profile: { create: {} },
    },
  });

  console.log(`Created SUPER_ADMIN user: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
