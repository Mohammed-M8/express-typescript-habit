import bcrypt from 'bcrypt'
import jsonwebtoken, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'
import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { ZodSchema } from 'zod/v3'
import z from 'zod'

const SALT_ROUNDS = 10

const registerUserSchema = z.object({
    name: z.string().nonempty().max(30),
    email: z.email().nonempty().max(255),
    password: z.string().nonempty().min(8),
})

const loginUserSchema = registerUserSchema.omit({ name: true })

const register = async (req: Request, res: Response,) => {
    const body = registerUserSchema.safeParse(req.body)
    if (body.success) {
        const exists = await prisma.user.findUnique({
            where: { email: body.data.email }
        })

        if (exists) {
            return res.status(409).send("User with this email exists")
        }
        const passwordHash = await bcrypt.hash(body.data.password, SALT_ROUNDS)
        const registerUser = await prisma.user.create({
            data: {
                name: body.data.name,
                email: body.data.email,
                passwordHash: passwordHash
            }
        })
        const user = await prisma.user.findUnique({
            where: { email: registerUser.email }
        })

        if (!user) return res.status(500).send('user not retrieved')

        const token = jsonwebtoken.sign({}, process.env.JWT_SECRET!, { subject: user.id, expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as SignOptions['expiresIn'] })


        return res.status(201).send({token})
    }
    else {
        return res.status(400).send(body.error.message)
    }



}


const login = async (req: Request, res: Response) => {
    const body = loginUserSchema.safeParse(req.body)
    if (body.success) {
        const user = await prisma.user.findUnique({
            where: { email: body.data.email }
        })

        if (!user) return res.status(500).send("User with this email does not exist")

        const compare = await bcrypt.compare(body.data.password, user.passwordHash)
        if (!compare) return res.status(400).send("Password or Email Mismatch!")

        const token=jsonwebtoken.sign({},process.env.JWT_SECRET!,{subject:user.id,expiresIn:(process.env.JWT_EXPIRES_IN||'1h') as SignOptions['expiresIn']})

        res.status(200).send({token})
    } else {
        return res.status(500).send(body.error.message)
    }
}

export { register, login }