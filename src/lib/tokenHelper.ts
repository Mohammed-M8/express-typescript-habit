import jsonwebtoken, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'
import crypto from 'crypto'
import { Request, Response } from 'express';
import { prisma } from './prisma';
import z from 'zod';

const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;

const refreshTokenSchema = z.string().min(1).max(200)


const generateAccessToken = (id: string) => {
    const token = jsonwebtoken.sign({}, process.env.JWT_SECRET!, { subject: id, expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'] })
    return token
}

const generateRefreshToken = () => {
    const refreshToken = crypto.randomBytes(50).toString('hex')
    return refreshToken
}

const generateRefreshTokenHash = (token: string) => {
    const refreshHash = crypto.createHash('sha256').update(token).digest('hex')
    return refreshHash
}

const issueTokens = async (id: string, req: Request, res: Response) => {
    const token = generateAccessToken(id)
    const refreshToken = generateRefreshToken()
    const refreshHash = generateRefreshTokenHash(refreshToken)

    const expiresAt = new Date(Date.now() + REFRESH_TTL)
    const createRefresh = await prisma.refreshToken.create({
        data: {
            tokenHash: refreshHash,
            userId: id,
            expiresAt: expiresAt
        }
    })

    if (req.headers["x-client-type"] === "mobile") {
        return { token, refreshToken }
    }

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/auth",
        expires: expiresAt
    })

    return { token }


}

const getRefreshToken = (req: Request) => {
    const raw = req.headers["x-client-type"] === "mobile" ? req.body?.refreshToken : req.cookies?.refreshToken
    const parsed = refreshTokenSchema.safeParse(raw)

    return parsed.success ? parsed.data : null

}


export { REFRESH_TTL, generateAccessToken, generateRefreshToken, generateRefreshTokenHash, issueTokens,getRefreshToken }