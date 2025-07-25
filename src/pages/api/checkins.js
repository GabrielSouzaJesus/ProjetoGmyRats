import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  const checkins = readCSV('check_ins.csv');
  // console.log("Check-ins:", checkins.slice(0, 3)); 
  res.status(200).json(checkins);
}
