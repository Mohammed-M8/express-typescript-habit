import express from 'express'
import { isSignedIn } from '../middlewares/isSignedIn'
import habitsCtrl from '../controllers/habitsCtrl'
const router = express.Router()

router.get('', habitsCtrl.getHabits)
router.post('', habitsCtrl.createHabit)
router.get('/:id', habitsCtrl.getHabit)
router.put('/:id', habitsCtrl.updateHabit)
router.delete('/:id', habitsCtrl.deleteHabit)


export default router