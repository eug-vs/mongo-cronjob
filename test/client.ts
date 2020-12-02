import { Schema } from 'mongoose';
import { Client } from '../lib';
import { Event as EventBase } from '../lib/event.model';
import connection from './utils/dbConnection';

interface Context {
  message: string;
}

export type Event = EventBase<Context>;

const contextSchema = new Schema({
  message: String
});

const client = new Client<Context>(connection, contextSchema);

export default client;

