import express from 'express'
import * as authCtrl from '../controllers/authCtrl'
import { isSignedIn } from '../middlewares/isSignedIn'
const router=express.Router()
router.post("/register",authCtrl.register)
router.post("/login",authCtrl.login)
router.post("/refresh",isSignedIn,authCtrl.refresh)
router.post("/logout",isSignedIn,authCtrl.logout)

export default router