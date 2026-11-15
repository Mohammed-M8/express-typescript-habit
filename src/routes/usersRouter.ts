import express from 'express'
import { isSignedIn } from '../middlewares/isSignedIn.js'
import * as usersCtrl from '../controllers/usersCtrl.js'
const router=express.Router()

router.get('/me',usersCtrl.getUser)

export default router