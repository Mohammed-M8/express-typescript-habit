import { prisma } from "./prisma.js"

export const cleanupTokens = () =>
    prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } }
    })



