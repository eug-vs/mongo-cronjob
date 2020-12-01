import { Schema, Types, Document } from 'mongoose';

export interface LogDocument extends Document {
  eventId: string;
  message: string;
}

const schema = new Schema({
  eventId: Types.ObjectId,
  message: String
}, { timestamps: true });


export default schema;

