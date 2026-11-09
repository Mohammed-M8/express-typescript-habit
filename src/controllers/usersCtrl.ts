import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getUser=async (req:Request,res:Response)=>{
    const userId=req.userId
    
    const user=await prisma.user.findUnique({
        where:{id:userId},
        select:{id:true,name:true,email:true}
    })

    if(!user) return res.status(404).send({error:"User not found"})
    
    res.status(200).send(user)
}


export {getUser}