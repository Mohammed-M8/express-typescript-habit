import express from 'express'
import { isSignedIn } from '../middlewares/isSignedIn'
import * as usersCtrl from '../controllers/usersCtrl'
const router=express.Router()

router.get('/me',usersCtrl.getUser)

export default router