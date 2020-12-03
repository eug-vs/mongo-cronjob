import { model, Schema, Model } from 'mongoose';
import cron from 'cron';
import schema, { EventDocument } from './event.schema';
import { LogDocument } from './log.schema';
import { LogModel } from './log.model';
import Connection from './connection';

export interface Event<Context = any> extends EventDocument<Context> {
  log(message: string): Promise<LogDocument>;
  start(): void;
  complete(): void;
  fail(error: Error | string): void;
  computeNextRunAt(): Date;
  getLogs(): Promise<LogDocument[]>;
}

export interface EventModel<Context = any> extends Model<Event<Context>> {
  findNextEvents(): Event<Context>[];
  findMissedEvents(): Event<Context>[];
}

const { CronJob } = cron;

const createEventModel = (connection: Connection): EventModel => {
  const LogModel: LogModel = connection.models['Log'];

  // Schema methods
  schema.method('log', function (message: string) {
    const timestamp = new Date().toLocaleString('en');
    console.log(`[${timestamp}] ${this.type}: ${message}`);
    return LogModel.create({ eventId: this._id, message });
  });

  schema.method('start', function () {
    this.log('Event started');
    this.lastRunAt = new Date();
    this.status = 'running';
    return this.save();
  });

  schema.method('complete', function () {
    this.log('Event complete');
    this.status = 'complete';
    return this.save();
  });

  schema.method('fail', function (error: Error) {
    this.log(error);
    this.log('Event failed');
    this.error = error;
    this.status = 'failed';
    return this.save();
  });

  schema.method('computeNextRunAt', function () {
    const job = new CronJob(this.schedule);
    const nextRunAt = job.nextDates();
    return nextRunAt.toDate();
  });

  schema.method('getLogs', function () {
    return LogModel.find({ eventId: this._id });
  });

  // Statics
  schema.static('findMissedEvents', async function () {
    return this.find({
      nextRunAt: {
        // TODO: skip single-fire events
        $lt: new Date()
      }
    });
  });

  schema.static('findNextEvents', function (limit = 10) {
    return this.find(
      {
        nextRunAt: {
          $gt: new Date()
        }
      },
      null,
      {
        sort: {
          nextRunAt: 1
        },
        limit
      }
    );
  });

  // Hooks
  schema.pre<Event>('save', async function () {
    this.nextRunAt = this.computeNextRunAt();
  });

  return connection.model<Event, EventModel>('Event', schema);
};


export default createEventModel;

