import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";

const createHabitSchema = z.object({
    title: z.string().min(1).max(30),
    description: z.string().max(256).optional(),
})

const getHabits = async (req: Request, res: Response) => {
    const habits = await prisma.habit.findMany({
        where: { userId: req.userId },
        select:{
            id:true,
            title:true,
            description:true
        }
    })

    res.status(200).send(habits)
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

const getHabit=async (req:Request<{id:string}>,res:Response)=>{
    const {id}=req.params
    if(!id) return res.status(400).send({error:"Missing Habit Id"})

    const habit=await prisma.habit.findUnique({
        where:{
            id:id
        },
        select:{
            id:true,
            title:true,
            description:true
        }
    })

    if(!habit) return res.status(404).send({error:"Habit not found"})

    return res.status(200).send(habit)
}



export default { getHabits, createHabit,getHabit }