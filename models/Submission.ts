import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  studentId: string;
  submissionId: number;
  contestId?: number;
  problemName: string;
  problemRating?: number;
  verdict: string;
  programmingLanguage: string;
  submissionTime: Date;
  createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  submissionId: { type: Number, required: true, unique: true },
  contestId: { type: Number },
  problemName: { type: String, required: true },
  problemRating: { type: Number },
  verdict: { type: String, required: true },
  programmingLanguage: { type: String, required: true },
  submissionTime: { type: Date, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);