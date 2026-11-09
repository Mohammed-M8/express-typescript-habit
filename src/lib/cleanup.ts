import { prisma } from "./prisma"

export const cleanupTokens = () =>
    prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } }
    })



