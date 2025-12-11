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
  reminderTime?: string;
  createdAt: Date;
}

const HabitSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
    }],
    reminderTime: {
      type: String, // e.g., "09:00"
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
export default Habit;
