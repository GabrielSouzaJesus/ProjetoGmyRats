import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const messages = readCSV('messages.csv');
  res.status(200).json(messages);
} 