import { Request, Response } from 'express';
import Habit from '../models/Habit';
import TrackingLog from '../models/TrackingLog';
import dayjs from 'dayjs';

// helper to check if user is authorized
const checkAuth = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({ message: 'User not found' });
    return false;
  }
  return true;
};

/*
 * Create new habit
 * POST /api/habits
 */
export const createHabit = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const { title, description, frequency, tags, reminderTime } = req.body;

  const habit = await Habit.create({
    user: req.user!._id,
    title,
    description,
    frequency,
    tags,
    reminderTime
  });

  res.status(201).json(habit);
};

/*
 * Get all habits for current user
 * GET /api/habits
 * supports pagination (?page=1) and tag filtering (?tag=health)
 */
export const getHabits = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;

  const pageSize = 10; // items per page
  const page = Number(req.query.page) || 1;
  const tag = req.query.tag as string;

  // build query based on whether tag filter is applied
  let query: any = { user: req.user!._id };
  if (tag) {
    query.tags = tag;
  }

  const count = await Habit.countDocuments(query);
  const habits = await Habit.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ 
    habits, 
    page, 
    pages: Math.ceil(count / pageSize) 
  });
};

// get single habit by id
export const getHabitById = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  // make sure user owns this habit
  if (habit.user.toString() !== req.user!._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  res.json(habit);
};

// update habit
export const updateHabit = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user!._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // update fields if provided
  habit.title = req.body.title || habit.title;
  habit.description = req.body.description || habit.description;
  habit.frequency = req.body.frequency || habit.frequency;
  habit.tags = req.body.tags || habit.tags;
  habit.reminderTime = req.body.reminderTime || habit.reminderTime;

  const updated = await habit.save();
  res.json(updated);
};

// delete habit
export const deleteHabit = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user!._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  await habit.deleteOne();
  res.json({ message: 'Habit removed' });
};

/*
 * Track habit completion for today
 * Also handles streak calculation
 */
export const trackHabit = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user!._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const today = dayjs().startOf('day').toDate();
  const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

  // check if already tracked today
  const alreadyTracked = await TrackingLog.findOne({
    habit: habit._id,
    date: today
  });

  if (alreadyTracked) {
    res.status(400).json({ message: 'Habit already tracked for today' });
    return;
  }

  // streak logic: if tracked yesterday, increment; otherwise reset to 1
  const trackedYesterday = await TrackingLog.findOne({
    habit: habit._id,
    date: yesterday
  });

  habit.streak = trackedYesterday ? habit.streak + 1 : 1;
  
  // update longest streak if needed
  if (habit.streak > habit.longestStreak) {
    habit.longestStreak = habit.streak;
  }

  await habit.save();

  // create tracking log entry
  const log = await TrackingLog.create({
    habit: habit._id,
    date: today,
    completed: true
  });

  res.status(201).json({ 
    log, 
    streak: habit.streak, 
    longestStreak: habit.longestStreak 
  });
};

// get last 7 days of tracking history
export const getHabitHistory = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user!._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const weekAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

  const logs = await TrackingLog.find({
    habit: habit._id,
    date: { $gte: weekAgo }
  }).sort({ date: -1 });

  res.json(logs);
};
