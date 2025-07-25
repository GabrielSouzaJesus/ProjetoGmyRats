import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const teams = readCSV('teams.csv');
  res.status(200).json(teams);
}
