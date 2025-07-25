import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const members = readCSV('members.csv');
  res.status(200).json(members);
}
