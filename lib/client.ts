import { Schema } from 'mongoose';
import Connection from './connection';
import createEventModel, { EventModel } from './event.model';
import createLogModel, { LogModel } from './log.model';


class Client<Context> {
  public connection: Connection;
  public Event: EventModel<Context>;
  public Log: LogModel;

  constructor(connection: Connection, contextSchema: Schema) {
    this.connection = connection;
    this.Log = createLogModel(connection);
    this.Event = createEventModel<Context>(connection, contextSchema);
  }
}


export default Client;

