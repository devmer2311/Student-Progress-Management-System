import mongoose, { Schema, Document } from 'mongoose';

export interface IContest extends Document {
  studentId: string;
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  participationType: string;
  problemsSolved: number;
  totalProblems: number;
  contestTime: Date;
  createdAt: Date;
}

const ContestSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  contestId: { type: Number, required: true },
  contestName: { type: String, required: true },
  rank: { type: Number, required: true },
  oldRating: { type: Number, required: true },
  newRating: { type: Number, required: true },
  ratingChange: { type: Number, required: true },
  participationType: { type: String, required: true },
  problemsSolved: { type: Number, default: 0 },
  totalProblems: { type: Number, default: 0 },
  contestTime: { type: Date, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Contest || mongoose.model<IContest>('Contest', ContestSchema);