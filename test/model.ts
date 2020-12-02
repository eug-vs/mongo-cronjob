import { Schema } from 'mongoose';
import model from '../lib/event.model';

interface Context {
  message: string;
}

const contextSchema = new Schema({
  message: String
});

const CustomEventModel = model<Context>('CustomEvent', contextSchema);


export default CustomEventModel;

