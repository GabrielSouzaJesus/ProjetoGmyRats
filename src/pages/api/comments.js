import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const comments = readCSV('comments.csv');
  res.status(200).json(comments);
} 