import rateLimit from "express-rate-limit";
import { error } from "node:console";

export const authLimiter=rateLimit({
    windowMs:15*60*1000,
    limit:10,
    standardHeaders:'draft-7',
    legacyHeaders:false,
    message:{error:'Too many attempts, try again later'}
})


export const refreshLimiter=rateLimit({
    windowMs:15*60*1000,
    limit:60,
    standardHeaders:'draft-7',
    legacyHeaders:false,
})