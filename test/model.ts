import { Schema } from 'mongoose';
import model, { Event } from '../lib/event.model';

interface Context {
  message: string;
}

export type CustomEvent = Event<Context>;

const contextSchema = new Schema({
  message: String
});

const CustomEventModel = model<Context>('CustomEvent', contextSchema);


export default CustomEventModel;

