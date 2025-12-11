import mongoose, { Document, Schema } from 'mongoose';
import { IHabit } from './Habit';

export interface ITrackingLog extends Document {
  habit: IHabit['_id'];
  date: Date;
  completed: boolean;
}

const TrackingLogSchema: Schema = new Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Habit',
    },
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one log per habit per day
TrackingLogSchema.index({ habit: 1, date: 1 }, { unique: true });

const TrackingLog = mongoose.model<ITrackingLog>('TrackingLog', TrackingLogSchema);
export default TrackingLog;
