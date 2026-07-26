import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não configurada.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Lenon Alexandre";
  const email = (process.env.SEED_ADMIN_EMAIL || "lenon@ateliux.com.br").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "financeiro2026";
  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    create: {
      name,
      email,
      passwordHash,
      emailVerifiedAt: new Date(),
      preferences: { create: {} },
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "lenon-pessoal" },
    update: {
      ownerUserId: user.id,
      name: "Meu espaço pessoal",
      description: "Organização financeira pessoal de Lenon Alexandre.",
    },
    create: {
      ownerUserId: user.id,
      name: "Meu espaço pessoal",
      slug: "lenon-pessoal",
      description: "Organização financeira pessoal de Lenon Alexandre.",
      type: "PERSONAL",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          lastAccessAt: new Date(),
        },
      },
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: { defaultWorkspaceId: workspace.id },
    create: { userId: user.id, defaultWorkspaceId: workspace.id },
  });

  console.log("\nSeed concluído.");
  console.log(`Usuário: ${email}`);
  console.log(`Senha: ${password}`);
  console.log(`Espaço: ${workspace.name}\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
