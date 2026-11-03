import express, { Request, Response } from 'express'
import morgan from 'morgan'

const app=express()

app.use(morgan('dev'))

const PORT=process.env.PORT?process.env.PORT:3000
app.listen(PORT,()=>{
    console.log("Server is listening on 3000")
})

app.get('/health',(req:Request,res:Response)=>{
    res.send("Active!")
})