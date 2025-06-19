import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastDataUpdate: Date;
  reminderCount: number;
  emailsEnabled: boolean;
  lastSubmissionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  codeforcesHandle: { type: String, required: true, unique: true },
  currentRating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  lastDataUpdate: { type: Date, default: Date.now },
  reminderCount: { type: Number, default: 0 },
  emailsEnabled: { type: Boolean, default: true },
  lastSubmissionDate: { type: Date },
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);