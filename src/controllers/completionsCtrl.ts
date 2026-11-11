import { Request, Response } from "express";
import { parseId } from "../lib/validation";
import { prisma } from "../lib/prisma";
import z from "zod";
import { id } from "zod/locales";

const completionSchema = z.object({
    day: z.iso.date()
})

const createCompletion = async (req: Request<{ id: string }>, res: Response) => {
    const params = parseId(req.params.id)
    if (!params.success) return res.status(400).send({ error: params.error.message })

    const body = completionSchema.safeParse(req.body)
    if (!body.success) return res.status(400).send({ error: body.error.message })

    const habit = await prisma.habit.findFirst({
        where: { id: params.data, userId: req.userId },
        select: { id: true }
    })

    if (!habit) return res.status(404).send({ error: "Habit not found" })

    const day = new Date(`${body.data.day}T00:00:00.000Z`)

    const completion = await prisma.completion.upsert({
        where: { habitId_day: { habitId: habit.id, day } },
        create: {
            habitId: habit.id,
            day
        },
        update: {},
        select: { id: true, day: true }
    })

    return res.status(201).send(completion)
}

const deleteCompletion = async (req: Request<{ id: string, completionId: string }>, res: Response) => {
    const params = z.object({ id: z.uuid(), completionId: z.uuid() }).safeParse(req.params)
    if (!params.success) return res.status(400).send({ error: 'Invalid id' })
    const { id, completionId } = params.data

    const result = await prisma.completion.deleteMany({
        where: { habit: { id: id, userId: req.userId }, id: completionId }
    })

    if (result.count === 0) return res.status(404).send({ error: "Completion not found" })
    return res.sendStatus(204)

}
const getCompletions = async (req: Request<{ id: string }>, res: Response) => {
    const params = parseId(req.params.id)
    if (!params.success) return res.status(404).send({ error: params.error.message })
    const id = params.data
    const result = await prisma.completion.findMany({
        where: { habit: { id: id, userId: req.userId } }
    })

    return res.status(200).send(result)
}
export { createCompletion,getCompletions,deleteCompletion }