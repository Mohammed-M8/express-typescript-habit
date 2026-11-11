import express, { Request, Response } from 'express'
import morgan from 'morgan'
import 'dotenv/config'
import path from 'path'
import cookieParser from 'cookie-parser'
import { cleanupTokens } from './lib/cleanup'

import authRouter from './routes/authRouter'
import usersRouter from './routes/usersRouter'
import habitsRouter from './routes/habitsRouter'
import completionsRouter from './routes/completionsRouter'

import { isSignedIn } from './middlewares/isSignedIn'
import { errorHandler } from './middlewares/errorhandler'

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())
app.use(morgan('dev'))



const PORT = process.env.PORT ? process.env.PORT : 3000


app.get('/health', (req: Request, res: Response) => {
    res.send("Active!")
})



app.use('/auth', authRouter)
app.use(isSignedIn)
app.use('/users', usersRouter)
app.use('/habits', habitsRouter)
app.use('/habits/:id/completions',completionsRouter)
app.use(errorHandler)


app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})

cleanupTokens().catch(console.error)

setInterval(() => cleanupTokens().catch(console.error), 24 * 60 * 60 * 1000)