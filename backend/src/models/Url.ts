import { Schema, model, Document, Types } from 'mongoose';

export interface IUrl extends Document {
  shortCode: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  owner: Types.ObjectId;
  createdAt: Date;
  expiresAt?: Date | null;
}

const UrlSchema = new Schema<IUrl>(
  {
    shortCode:   { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true },
    title:       { type: String, default: '' },
    clicks:      { type: Number, default: 0 },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt:   { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default model<IUrl>('Url', UrlSchema);
