// src/pages/api/team_memberships.js
import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const teamMemberships = readCSV('team_memberships.csv');
  res.status(200).json(teamMemberships);
}
