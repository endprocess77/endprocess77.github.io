import fs from 'fs';
import path from 'path';

export interface Player {
  name: string;
  role: string;
  batting: string;
  bowling: string;
  technique: number;
  timing: number;
  aggression: number;
  movement: number;
  accuracy: number;
  fielding: number;
}

export function getPlayers(): Player[] {
  const filePath = path.join(process.cwd(), 'cricket_players_ranked.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split lines and handle carriage returns
  const lines = fileContent.split(/\r?\n/);
  const players: Player[] = [];

  // Line 0 is header: Name,Role,Batting,Bowling,Technique,Timing,Aggression,Movement,Accuracy,Fielding
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple robust comma splitter that handles quotes if any.
    // Since there are no complex quotes in our columns, split by comma is safe.
    const parts = line.split(',');
    if (parts.length < 10) continue;

    players.push({
      name: parts[0].trim(),
      role: parts[1].trim(),
      batting: parts[2].trim(),
      bowling: parts[3].trim(),
      technique: parseFloat(parts[4]) || 0,
      timing: parseFloat(parts[5]) || 0,
      aggression: parseFloat(parts[6]) || 0,
      movement: parseFloat(parts[7]) || 0,
      accuracy: parseFloat(parts[8]) || 0,
      fielding: parseFloat(parts[9]) || 0,
    });
  }

  return players;
}
