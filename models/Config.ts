import mongoose, { Schema, Document } from 'mongoose';

export interface IConfig extends Document {
  key: string;
  value: any;
  updatedAt: Date;
}

const ConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);