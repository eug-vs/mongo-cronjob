import { Client } from '../lib';
import connection from './utils/dbConnection';

const client = new Client(connection);

export default client;

