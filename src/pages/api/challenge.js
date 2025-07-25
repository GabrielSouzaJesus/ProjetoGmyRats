import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const challenge = readCSV('challenge.csv');
  res.status(200).json(challenge);
} 