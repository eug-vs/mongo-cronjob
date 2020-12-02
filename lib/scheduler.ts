import cron from 'cron';
import Bluebird from 'bluebird';
import { EventModel, Event } from './event.model';

export type Handler = (event: Event<any>) => void;

const CronJob = cron.CronJob;

const defaultPollingInterval = '*/10 * * * * *';


class Scheduler {
  job: cron.CronJob;
  jobs: cron.CronJob[];
  Model: EventModel<any>;
  handlers: Record<string, Handler>;

  constructor(model: EventModel<any>, pollingInterval = defaultPollingInterval) {
    this.Model = model;
    this.jobs = [];
    this.handlers = {};

    this.job = new CronJob(pollingInterval, () => this.updateJobs());
    this.startPolling();
  }

  registerHandler(name: string, handler: Handler) {
    this.handlers[name] = handler;
  }

  startPolling() {
    this.job.start();
  }
  
  stopPolling() {
    this.job.stop();
  }

  startAllJobs() {
    this.jobs.forEach(job => job.start());
  }

  stopAllJobs() {
    this.jobs.forEach(job => job.stop());
  }

  async rescheduleMissedEvents() {
    const missedEvents = await this.Model.findMissedEvents();
    return Bluebird.map(missedEvents, event => event.save());
  }

  async updateJobs() {
    // Reschedule missed events before we stop jobs to avoid
    // accidentally stopping the job that has not triggered yet
    // (if event schedule resonates with updateJobs schedule)
    await this.rescheduleMissedEvents();

    this.stopAllJobs();

    const events = await this.Model.findNextEvents();
    if (!events.length) console.log('WARNING: no upcoming events');
    this.jobs = events.map(event => new CronJob(
      event.schedule,
      () => this.run(event.id)
    ));

    this.startAllJobs();
  }

  async run(id: string) {
    const event = await this.Model.findById(id);
    if (!event) return console.log('WARNING: locked event does not exist');

    try {
      const handleEvent = this.handlers[event.type];

      if (handleEvent) {
        event.start();
        await handleEvent(event);
        return event.complete();
      } else throw new Error('No handler found')

    } catch (error) {
      return event.fail(error);
    }
  }
}


export default Scheduler;

