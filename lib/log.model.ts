import { model, Model } from 'mongoose';
import schema, { LogDocument } from './log.schema';

const LogModel = model<LogDocument, Model<LogDocument>>('Log', schema);


export default LogModel;

