# mongo-cronjob
Cron-based job scheduler which persists events to MongoDB

## Usage example
```js
// Define schema for event context and wrap it into a model
const contextSchema = new Schema({ message: String });
const EventModel = model('Event', contextSchema);

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
