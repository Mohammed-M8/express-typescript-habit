import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";

const createHabitSchema = z.object({
    title: z.string().trim().min(1).max(30),
    description: z.string().trim().max(256).optional(),
})

const idSchema = z.uuid()

const getHabits = async (req: Request, res: Response) => {
    const habits = await prisma.habit.findMany({
        where: { userId: req.userId },
        select: {
            id: true,
            title: true,
            description: true
        }
    })

    return res.status(200).send(habits)
}


const createHabit = async (req: Request, res: Response) => {
    const habit = createHabitSchema.safeParse(req.body)
    if (!habit.success) return res.status(400).send({ error: "Missing Habit to create" })


    const { title, description } = habit.data

    const createdHabit = await prisma.habit.create({
        data: {
            title: title,
            description: description,
            userId: req.userId!
        }, select: {
            id: true,
            title: true,
            description: true
        }
    })

    return res.status(201).send(createdHabit)

}

const getHabit = async (req: Request<{ id: string }>, res: Response) => {
    const params = parseId(req.params.id)
    if (!params.success) return res.status(400).send({ error: "Missing Habit Id" })
    const id = params.data
    const habit = await prisma.habit.findFirst({
        where: {
            id: id,
            userId: req.userId
        },
        select: {
            id: true,
            title: true,
            description: true
        }
    })

    if (!habit) return res.status(404).send({ error: "Habit not found" })

    return res.status(200).send(habit)
}

const updateHabit = async (req: Request<{ id: string }>, res: Response) => {
    const params = parseId(req.params.id)
    if (!params.success) return res.status(400).send({ error: "Missing Habit Id" })
    const id = params.data
    const body = createHabitSchema.safeParse(req.body)
    if (!body.success) return res.status(400).send({ error: body.error.message })
    const { title, description } = body.data
    const habit = await prisma.habit.updateMany({
        where: { id: id, userId: req.userId },
        data: {
            title: title,
            description: description ?? null
        }
    })

    if (!habit.count) return res.status(404).send({ error: "Habit not found" })

    return res.sendStatus(204)

}

const deleteHabit = async (req: Request<{ id: string }>, res: Response) => {
    const params = parseId(req.params.id)
    if (!params.success) return res.status(400).send({ error: "Missing Habit Id" })
    const id = params.data
    const result = await prisma.habit.deleteMany({
        where: { id: id, userId: req.userId }
    })

    if (result.count === 0) return res.status(404).send({ error: "Habit not found" })

    return res.sendStatus(204)
}

const parseId = (id: string | undefined) => {
    return idSchema.safeParse(id)
}


export default { getHabits, createHabit, getHabit, updateHabit, deleteHabit }