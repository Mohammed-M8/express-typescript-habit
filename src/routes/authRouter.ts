import express from 'express'
import * as authCtrl from '../controllers/authCtrl'
const router=express.Router()
router.post("/register",authCtrl.register)
router.post("/login",authCtrl.login)

export default router