import mongoose from 'mongoose';
import Promise from 'bluebird';

mongoose.Promise = Promise;

const MONGODB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-cronjob-test';
const { MONGODB_USER, MONGODB_PASSWORD } = process.env;

mongoose.connect(MONGODB_URL, {
  user: MONGODB_USER,
  pass: MONGODB_PASSWORD,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4 // Use IPv4, skip trying IPv6
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connection to MongoDB successful');
});

export default db;

