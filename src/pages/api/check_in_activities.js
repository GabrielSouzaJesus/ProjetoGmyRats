import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const activities = readCSV('check_in_activities.csv');
  res.status(200).json(activities);
}