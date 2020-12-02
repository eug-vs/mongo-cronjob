import { expect } from 'chai';
import Scheduler from '../lib/scheduler';
import Model, { CustomEvent } from './model';
import connection from './utils/dbConnection';

const sleep = async (time: number) => new Promise<void>(res => setTimeout(res, time));

describe('Scheduler', async () => {
  let event: CustomEvent;
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler(Model);
  });

  afterEach(() => {
    scheduler.stopPolling();
  });

  before(async () => {
    event = await Model.create({
      type: 'test',
      schedule: '*/15 * * * * *', // Every 15 seconds
      context: {
        message: 'Hello, world!'
      },
    });
  });

  after(async () => {
    connection.dropCollection('customevents');
  });


  it('Should run event', async () => {
    // Wait until job is run
    await new Promise<void>(res => {
      scheduler.registerHandler('test', async (event: CustomEvent) => {
        await sleep(2000);
        await event.log(event.context.message)
        res();
      });
    });

    // Wait for status to change
    await sleep(100);

    const updatedEvent = await Model.findOne();
    expect(updatedEvent).to.have.property('status').equal('complete');
  });


  it('Should fail an event if no handler is present', async () => {
    await sleep(25000);

    const updatedEvent = await Model.findOne();
    expect(updatedEvent).to.have.property('status').equal('failed');
    expect(updatedEvent).to.have.property('error').equal('Error: No handler found');
  });
});
