import cron from 'cron';
import Bluebird from 'bluebird';
import { EventModel } from './model';

const CronJob = cron.CronJob;

class Scheduler {
  jobs: cron.CronJob[];
  Model: EventModel<any>;

  constructor(model: EventModel<any>) {
    this.Model = model;
    this.jobs = [];

    const job = new CronJob('*/10 * * * * *', () => this.updateJobs());
    job.start();
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
    // TODO: handle the case when event is deleted
    if (!event) return;

    try {
      event.start();
      // TODO: put actual handler here
      await new Promise(res => setTimeout(res, 5000));
      return event.complete();
    } catch (error) {
      event.fail(error);
    }
  }
}


export default Scheduler;

