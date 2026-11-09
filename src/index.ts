import express, { Request, Response } from 'express'
import morgan from 'morgan'
import authRouter from './routes/authRouter'
import 'dotenv/config'
import path from 'path'
import cookieParser from 'cookie-parser'
import { cleanupTokens } from './lib/cleanup'

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())
app.use(morgan('dev'))



const PORT = process.env.PORT ? process.env.PORT : 3000



app.use('/auth', authRouter)

app.get('/health', (req: Request, res: Response) => {
    res.send("Active!")
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})

cleanupTokens().catch(console.error)

setInterval(()=>cleanupTokens().catch(console.error),24*60*60*1000)