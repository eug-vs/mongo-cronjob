import { model, Model } from 'mongoose';
import schema, { LogDocument } from './log.schema';
import Connection from './connection';

export type LogModel = Model<LogDocument>;

const createLogModel = (connection: Connection): LogModel => {
  return connection.model<LogDocument, LogModel>('Log', schema);
};


export default createLogModel;

