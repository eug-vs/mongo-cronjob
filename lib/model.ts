import { model, Schema, Model } from 'mongoose';
import createEventSchema, { EventDocument } from './schema';
import cron from 'cron';

interface Event<Context> extends EventDocument<Context> {
  log(message: string): void;
  start(): void;
  complete(): void;
  fail(error: Error): void;
  computeNextRunAt(): Date;
}

export interface EventModel<Context> extends Model<Event<Context>> {
  findNextEvents(): Event<Context>[];
  findMissedEvents(): Event<Context>[];
}

const CronJob = cron.CronJob;

const createEventModel = <Context extends Schema>(name: string, contextSchema: Context): EventModel<Context> => {
  const schema = createEventSchema(contextSchema);

  // Schema methods
  schema.method('log', function(message: string) {
    // TODO: Actually create logs
    console.log(message);
  });

  schema.method('start', function() {
    this.log('Event started')
    this.lastRunAt = new Date();
    this.status = 'running';
    return this.save();
  });

  schema.method('complete', function() {
    this.log('Event complete')
    this.status = 'complete';
    return this.save();
  });

  schema.method('fail', function(error: Error) {
    this.log(error);
    this.error = error;
    this.status = 'failed';
    return this.save();
  });

  schema.method('computeNextRunAt', function() {
    const job = new CronJob(this.schedule);
    const nextRunAt = job.nextDates();
    return nextRunAt.toDate();
  });

  // Statics
  schema.static('findMissedEvents', async function () {
    return this.find({
      nextRunAt: {
        // TODO: skip single-fire events
        $lt: new Date()
      },
    });
  });

  schema.static('findNextEvents', function(limit = 10) {
    return this.find(
      {
        nextRunAt: {
          $gt: new Date()
        },
      },
      null,
      {
        sort: {
          nextRunAt: 1
        },
        limit
      }
    )
  });

  // Hooks
  schema.pre<Event<Context>>('save', async function() {
    this.nextRunAt = this.computeNextRunAt();
  });

  return model<Event<Context>, EventModel<Context>>(name, schema);
};


export default createEventModel;

