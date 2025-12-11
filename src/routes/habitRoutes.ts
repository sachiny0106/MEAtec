import express from 'express';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  trackHabit,
  getHabitHistory,
} from '../controllers/habitController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createHabit).get(protect, getHabits);
router
  .route('/:id')
  .get(protect, getHabitById)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

router.route('/:id/track').post(protect, trackHabit);
router.route('/:id/history').get(protect, getHabitHistory);

export default router;
