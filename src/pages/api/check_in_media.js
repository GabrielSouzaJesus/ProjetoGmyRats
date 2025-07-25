import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const media = readCSV('check_in_media.csv');
  res.status(200).json(media);
} 