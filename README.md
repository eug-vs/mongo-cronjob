# mongo-cronjob
Cron-based job scheduler which persists events to MongoDB

## Usage example
```js
const mongoose = require('mongoose');
const { Client, Scheduler } = require('mongo-cronjob');

// Define schema for event context
const contextSchema = new Schema({ message: String });

// Initialize client with existing connection
const client = new Client(mongoose.connection, contextSchema);
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
