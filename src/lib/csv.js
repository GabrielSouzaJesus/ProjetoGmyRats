import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export function readCSV(fileName) {
  const filePath = path.join(process.cwd(), 'Dados', fileName);
  const file = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
  return data;
}
