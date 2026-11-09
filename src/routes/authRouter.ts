import express from 'express'
import * as authCtrl from '../controllers/authCtrl'
import { authLimiter, refreshLimiter } from '../middlewares/rateLimit'
const router = express.Router()
router.post("/register", authLimiter, authCtrl.register)
router.post("/login", authLimiter, authCtrl.login)
router.post("/refresh", refreshLimiter, authCtrl.refresh)
router.post("/logout", authCtrl.logout)

export default router