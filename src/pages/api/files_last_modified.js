import fs from 'fs';
import path from 'path';

const files = [
  'challenge.csv',
  'members.csv',
  'teams.csv',
  'team_memberships.csv',
  'check_ins.csv',
  'check_in_activities.csv',
  'check_in_media.csv',
  'reactions.csv',
  'comments.csv',
  'messages.csv'
];

export default function handler(req, res) {
  const result = {};
  files.forEach(file => {
    const filePath = path.join(process.cwd(), 'Dados', file);
    try {
      const stats = fs.statSync(filePath);
      result[file] = stats.mtime; // data/hora da última modificação
    } catch (e) {
      result[file] = null;
    }
  });
  res.status(200).json(result);
}
