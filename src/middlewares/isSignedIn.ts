import { NextFunction, Request, Response } from "express";
import jsonwebtoken from 'jsonwebtoken'
import 'dotenv/config'
export const isSignedIn = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization
    const [scheme, token] = header?.split(' ') ?? []
    if (scheme !== "Bearer" || !token) return res.status(401).send({ error: "Login Invalid" })
    try {
        const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET!)
        if (typeof payload === "string" || !payload.sub) {
            return res.status(401).send({ error: "Login Invalid" })
        }
        req.userId = payload.sub
        return next()
    } catch (error) {
        return res.status(401).send({ error: "Login Invalid" })
    }
}