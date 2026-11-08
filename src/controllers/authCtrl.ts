import bcrypt from 'bcrypt'
import crypto from 'crypto'
import 'dotenv/config'
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import z from 'zod'
import { generateRefreshTokenHash, getRefreshToken, issueTokens } from '../lib/tokenHelper'
import { Prisma } from '../../generated/prisma/client'

const SALT_ROUNDS = 10
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS)

const registerUserSchema = z.object({
    name: z.string().nonempty().max(30),
    email: z.email().trim().toLowerCase().nonempty().max(255),
    password: z.string().min(8).max(72),
})

const loginUserSchema = registerUserSchema.omit({ name: true })

const register = async (req: Request, res: Response,) => {
    const body = registerUserSchema.safeParse(req.body)

    if (!body.success) return res.status(400).send(body.error.message)

    const passwordHash = await bcrypt.hash(body.data.password, SALT_ROUNDS)

    try {
        const registerUser = await prisma.user.create({
            data: {
                name: body.data.name,
                email: body.data.email,
                passwordHash: passwordHash
            }
        })
        const payload = await issueTokens(registerUser.id, req, res)
        return res.status(201).send(payload)



    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return res.status(409).send('User with this email exists')
        }
        throw e
    }
}







const login = async (req: Request, res: Response) => {
    const body = loginUserSchema.safeParse(req.body)
    if (!body.success) return res.status(400).send(body.error.message)

    const user = await prisma.user.findUnique({
        where: { email: body.data.email }
    })



    const hash = user?.passwordHash ?? DUMMY_HASH
    const valid = await bcrypt.compare(body.data.password, hash)
    if (!user || !valid) return res.status(401).send("Password or Email Invalid!")

    const payload = await issueTokens(user.id, req, res)
    return res.status(200).send(payload)

}

const refresh = async (req: Request, res: Response) => {
    const token = getRefreshToken(req)
    if (!token) return res.sendStatus(401)

    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: generateRefreshTokenHash(token) }
    })
    if (!stored ) return res.sendStatus(401)
    if (stored.revokedAt) {
        await prisma.refreshToken.deleteMany({
            where: { userId: stored.userId }
        })

        return res.sendStatus(403)
    }

    if (stored.expiresAt < new Date()) return res.sendStatus(401)

    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() }
    })

    const payload = await issueTokens(stored.userId, req, res)
    return res.status(200).send(payload)
}

const logout = async (req: Request, res: Response) => {
    const token = getRefreshToken(req)

    if (token) {
        await prisma.refreshToken.deleteMany({
            where: { tokenHash: generateRefreshTokenHash(token) }
        })
    }
    res.clearCookie('refreshToken', { path: '/auth' })
    res.sendStatus(204)
}

export { register, login, refresh, logout }