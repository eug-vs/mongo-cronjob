import Connection from './connection';
import createEventModel, { EventModel } from './event.model';
import createLogModel, { LogModel } from './log.model';


class Client {
  public connection: Connection;
  public Event: EventModel;
  public Log: LogModel;

  constructor(connection: Connection) {
    this.connection = connection;
    this.Log = createLogModel(connection);
    this.Event = createEventModel(connection);
  }
}


export default Client;

