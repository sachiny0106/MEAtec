import { Request, Response } from 'express';
import Habit from '../models/Habit';
import TrackingLog from '../models/TrackingLog';
import dayjs from 'dayjs';

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req: Request, res: Response) => {
  const { title, description, frequency, tags, reminderTime } = req.body;

  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }

  const habit = await Habit.create({
    user: req.user._id,
    title,
    description,
    frequency,
    tags,
    reminderTime,
  });

  res.status(201).json(habit);
};

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }

  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const tag = req.query.tag as string;

  const keyword = tag
    ? {
        user: req.user._id,
        tags: tag,
      }
    : { user: req.user._id };

  const count = await Habit.countDocuments(keyword);
  const habits = await Habit.find(keyword)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ habits, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Get a specific habit
// @route   GET /api/habits/:id
// @access  Private
export const getHabitById = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }
  const habit = await Habit.findById(req.params.id);

  if (habit) {
    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    res.json(habit);
  } else {
    res.status(404).json({ message: 'Habit not found' });
  }
};

// @desc    Update habit details
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }
  const habit = await Habit.findById(req.params.id);

  if (habit) {
    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    habit.title = req.body.title || habit.title;
    habit.description = req.body.description || habit.description;
    habit.frequency = req.body.frequency || habit.frequency;
    habit.tags = req.body.tags || habit.tags;
    habit.reminderTime = req.body.reminderTime || habit.reminderTime;

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } else {
    res.status(404).json({ message: 'Habit not found' });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }
  const habit = await Habit.findById(req.params.id);

  if (habit) {
    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    await habit.deleteOne();
    res.json({ message: 'Habit removed' });
  } else {
    res.status(404).json({ message: 'Habit not found' });
  }
};

// @desc    Mark the habit as completed for today
// @route   POST /api/habits/:id/track
// @access  Private
export const trackHabit = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const today = dayjs().startOf('day').toDate();
  const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();

  const existingLog = await TrackingLog.findOne({
    habit: habit._id,
    date: today,
  });

  if (existingLog) {
    res.status(400).json({ message: 'Habit already tracked for today' });
    return;
  }

  // Check for streak
  const lastLog = await TrackingLog.findOne({
    habit: habit._id,
    date: yesterday,
  });

  if (lastLog) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }

  if (habit.streak > habit.longestStreak) {
    habit.longestStreak = habit.streak;
  }

  await habit.save();

  const log = await TrackingLog.create({
    habit: habit._id,
    date: today,
    completed: true,
  });

  res.status(201).json({ log, streak: habit.streak, longestStreak: habit.longestStreak });
};

// @desc    Return the last 7 days of tracking
// @route   GET /api/habits/:id/history
// @access  Private
export const getHabitHistory = async (req: Request, res: Response) => {
  if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
  }
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate();

  const logs = await TrackingLog.find({
    habit: habit._id,
    date: { $gte: sevenDaysAgo },
  }).sort({ date: -1 });

  res.json(logs);
};
