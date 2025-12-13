import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IHabit extends Document {
  user: IUser['_id'];
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  longestStreak: number;
  tags: string[];
  reminderTime?: string; // optional, format "HH:MM"
  createdAt: Date;
}

const HabitSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: { type: String, required: true }, // habit name
    description: { type: String }, // optional
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily' // default to daily
    },
    streak: { type: Number, default: 0 }, // current streak
    longestStreak: { type: Number, default: 0 }, // best streak
    tags: [{ type: String }], // e.g. ["health", "work"]
    reminderTime: { type: String } // e.g. "09:00"
  },
  { timestamps: true }
);

const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
export default Habit;
