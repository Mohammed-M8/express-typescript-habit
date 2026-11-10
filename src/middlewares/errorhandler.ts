import { NextFunction, Request, Response } from "express";

export const errorHandler = async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(500).send({ error: "Internal server error" })
}