import { Schema, model, Document, Types } from 'mongoose';

export interface IClickEvent extends Document {
  url: Types.ObjectId;
  owner?: Types.ObjectId | null;
  shortCode: string;
  originalUrl: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  isPhishy: boolean;
  createdAt: Date;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    url: { type: Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    shortCode: { type: String, required: true, index: true },
    originalUrl: { type: String, required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    isPhishy: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export default model<IClickEvent>('ClickEvent', ClickEventSchema);
