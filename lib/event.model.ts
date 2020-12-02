import { model, Schema, Model } from 'mongoose';
import cron from 'cron';
import createEventSchema, { EventDocument } from './event.schema';
import { LogDocument } from './log.schema';
import LogModel from './log.model';

export interface Event<Context> extends EventDocument<Context> {
  log(message: string): Promise<LogDocument>;
  start(): void;
  complete(): void;
  fail(error: Error | string): void;
  computeNextRunAt(): Date;
  getLogs(): Promise<LogDocument[]>;
}

export interface EventModel<Context> extends Model<Event<Context>> {
  findNextEvents(): Event<Context>[];
  findMissedEvents(): Event<Context>[];
}

const { CronJob } = cron;

const createEventModel = <Context>(name: string, contextSchema: Schema): EventModel<Context> => {
  const schema = createEventSchema(contextSchema);

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
  schema.pre<Event<Context>>('save', async function () {
    this.nextRunAt = this.computeNextRunAt();
  });

  return model<Event<Context>, EventModel<Context>>(name, schema);
};


export default createEventModel;

