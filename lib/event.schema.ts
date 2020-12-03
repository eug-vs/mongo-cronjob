import { Schema, Document } from 'mongoose';

export interface EventDocument<Context = any> extends Document {
  type: string;
  schedule: string;
  status?: 'notStarted' | 'running' | 'complete' | 'failed';
  error?: string;
  context: Context;
  nextRunAt?: Date;
  lastRunAt?: Date;
}

const schema = new Schema({
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
  context: {},
  nextRunAt: Date,
  lastRunAt: Date
}, { timestamps: true });


export default schema;

