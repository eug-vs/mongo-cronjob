import { expect } from 'chai';
import client from './client';

const Model = client.Event;

describe('Event model', () => {
  after(async () => {
    client.connection.dropCollection('events');
  });

  it('Should assign status and nextRunAt on creation', async () => {
    const event = await Model.create({
      type: 'test',
      schedule: '* * * * *',
      context: {
        message: 'Hello, world!'
      },
    });
    expect(event.status).equal('notStarted');
    expect(event).to.have.property('nextRunAt');
  });

  describe('Methods', () => {
    it('log', async () => {
      const event = await Model.findOne();
      const log = await event?.log('Test message');
      expect(log).to.have.property('message').equal('Test message');
    });

    it('start');

    it('complete');

    it('fail');

    it('getLogs')

    it('computeNextRunAt');
  });

  describe('Statics', () => {
    it('findNextEvents');

    it('findMissedEvents');
  });
});
