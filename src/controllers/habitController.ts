import { Request, Response } from 'express';
import Habit from '../models/Habit';
import TrackingLog from '../models/TrackingLog';
import dayjs from 'dayjs';

// quick helper to check auth (returns false if not logged in)
const checkAuth = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({ message: 'User not found' });
    // TODO: maybe redirect to login page if this was a frontend
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

  // destructure with fallback for tags
  const { title, description, frequency, tags = [], reminderTime } = req.body;

  // console.log('Creating habit for user:', req.user?._id);
  const newHabit = await Habit.create({
    user: req.user!._id,
    title,
    description,
    frequency,
    tags,
    reminderTime
  });

  res.status(201).json(newHabit);
};

/*
 * Get all habits for current user
 * GET /api/habits
 * supports pagination (?page=1) and tag filtering (?tag=health)
 */
export const getHabits = async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;

  const pageSize = 10;
  const pageNum = Number(req.query.page) || 1;
  const tag = req.query.tag as string;

  // build query based on whether tag filter is applied
  let filter: any = { user: req.user!._id };
  if (tag) {
    filter.tags = tag;
  }

  const total = await Habit.countDocuments(filter);
  const habits = await Habit.find(filter)
    .limit(pageSize)
    .skip(pageSize * (pageNum - 1));

  res.json({ 
    habits, 
    page: pageNum, 
    pages: Math.ceil(total / pageSize) 
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

  // only allow owner to view
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

  // update only provided fields
  const { title, description, frequency, tags, reminderTime } = req.body;
  if (title) habit.title = title;
  if (description) habit.description = description;
  if (frequency) habit.frequency = frequency;
  if (tags) habit.tags = tags;
  if (reminderTime) habit.reminderTime = reminderTime;

  const updatedHabit = await habit.save();
  res.json(updatedHabit);
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
  // FIXME: maybe also delete related tracking logs?
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
  const logToday = await TrackingLog.findOne({
    habit: habit._id,
    date: today
  });

  if (logToday) {
    res.status(400).json({ message: 'Habit already tracked for today' });
    return;
  }

  // streak logic: if tracked yesterday, increment; otherwise reset to 1
  const logYesterday = await TrackingLog.findOne({
    habit: habit._id,
    date: yesterday
  });

  habit.streak = logYesterday ? habit.streak + 1 : 1;

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
