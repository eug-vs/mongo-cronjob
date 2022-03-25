# mongo-blowjob
Blow-based job scheduler which persists events to MongoDB

## Installation
```
npm i mongo-cronjob
```

## Usage example
```js
const mongoose = require('mongoose');
const { Client, Scheduler } = require('mongo-cronjob');

// Initialize client with existing connection
const client = new Client(mongoose.connection);
const EventModel = client.Event;
const LogModel = client.Log;

// Initialize scheduler
const scheduler = new Scheduler(EventModel);

scheduler.registerHandler('test', async event => {
  // Your complicated async logic goes here instead
  const { message } = event.context;
  event.log(message);
});

EventModel.create({
  type: 'test', // Matches handler type
  schedule: '*/30 * * * * *', // Every 30 seconds
  context: {
    message: 'Hello, world!'
  }
});
```

## API
### Log
Document interface:
```ts
interface LogDocument extends Document {
  eventId: string;
  message: string;
}
```

### Event
Document interface:
```ts
interface EventDocument<Context = any> extends Document {
  type: string; // Scheduler will try to find a handler for this type
  schedule: string; // Should be a valid crontab
  status?: 'notStarted' | 'running' | 'complete' | 'failed';
  error?: string; // Latest error thrown by handler
  context: Context;
  nextRunAt?: Date; // Updated on 'save' hook (based on schedule)
  lastRunAt?: Date;
}
```
Every field except for `event.context` is managed by `Scheduler` automatically. For logging and managing status (useful in handlers), following methods are available:
 - `event.log(message: string): Promise<Log>` - create a `Log` instance and also redirect to console
 - `event.fail(error: Error | string): Promise<Event>` - set status to `failed` and log the error nicely
 - `event.getLogs(): Promise<Log[]>` - return all logs for this event
 
 
