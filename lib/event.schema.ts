import { Schema, Document } from 'mongoose';

export interface EventDocument<Context> extends Document {
  type: string;
  schedule: string;
  status?: 'notStarted' | 'running' | 'complete' | 'failed';
  error?: string;
  context: Context;
  nextRunAt?: Date;
  lastRunAt?: Date;
}

const createEventSchema = (contextSchema: Schema) => new Schema({
  type: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'notStarted'
  },
  error: String,
  context: contextSchema,
  nextRunAt: Date,
  lastRunAt: Date
}, { timestamps: true });


export default createEventSchema;

