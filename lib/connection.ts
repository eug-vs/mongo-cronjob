import { model, Model } from 'mongoose';

// An interface for mongoose.connection
export interface Connection {
  model: typeof model;
  models: Record<string, Model<any, any>>;
  dropCollection: (name: string) => Promise<void>;
}


export default Connection;

