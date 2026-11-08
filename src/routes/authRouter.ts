import express from 'express'
import * as authCtrl from '../controllers/authCtrl'
const router=express.Router()
router.post("/register",authCtrl.register)
router.post("/login",authCtrl.login)
router.post("/refresh",authCtrl.refresh)
router.post("/logout",authCtrl.logout)

export default router