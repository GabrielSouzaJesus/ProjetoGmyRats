import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const reactions = readCSV('reactions.csv');
  res.status(200).json(reactions);
} 