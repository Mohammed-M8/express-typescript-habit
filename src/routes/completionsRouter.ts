import express from 'express'
import * as completionsCtrl from '../controllers/completionsCtrl'
const router=express.Router({mergeParams:true})

router.post("",completionsCtrl.createCompletion)
router.get("",completionsCtrl.getCompletions)
router.delete("/:completionId",completionsCtrl.deleteCompletion)

export default router