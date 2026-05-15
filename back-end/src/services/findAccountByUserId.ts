import { prisma } from "../lib/prisma.js";

export async function findAccountByUserId(userId: string) {
  return await prisma.account.findFirst({
    where: { userId },
  });
}
