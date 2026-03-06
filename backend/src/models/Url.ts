import { Schema, model, Document, Types } from 'mongoose';

export interface IUrl extends Document {
  shortCode: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  isPhishy: boolean;
  phishyReasons: string[];
  owner?: Types.ObjectId | null;
  createdAt: Date;
  expiresAt?: Date | null;
}

const UrlSchema = new Schema<IUrl>(
  {
    shortCode:   { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true },
    title:       { type: String, default: '' },
    clicks:      { type: Number, default: 0 },
    isPhishy:    { type: Boolean, default: false, index: true },
    phishyReasons: { type: [String], default: [] },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    expiresAt:   { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default model<IUrl>('Url', UrlSchema);
