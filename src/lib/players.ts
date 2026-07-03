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
  team: string;
}

export interface Team {
  name: string;
  slug: string;
  playersCount: number;
  avgRating: number;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getPlayers(): Player[] {
  const filePath = path.join(process.cwd(), 'cricket_players_ranked_with_teams.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split lines and handle carriage returns
  const lines = fileContent.split(/\r?\n/);
  const players: Player[] = [];

  // Line 0 is header: Name,Role,Batting,Bowling,Technique,Timing,Aggression,Movement,Accuracy,Fielding,Team
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 11) continue;

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
      team: parts[10].trim(),
    });
  }

  return players;
}

export function getTeams(): Team[] {
  const players = getPlayers();
  const teamMap: { [key: string]: Player[] } = {};

  players.forEach((player) => {
    if (player.team) {
      if (!teamMap[player.team]) {
        teamMap[player.team] = [];
      }
      teamMap[player.team].push(player);
    }
  });

  const teams: Team[] = Object.keys(teamMap).map((teamName) => {
    const squad = teamMap[teamName];
    // Calculate overall average rating of squad
    const totalRating = squad.reduce((sum, p) => {
      const playerAvg = (p.technique + p.timing + p.aggression + p.movement + p.accuracy + p.fielding) / 6;
      return sum + playerAvg;
    }, 0);
    const avgRating = squad.length > 0 ? parseFloat((totalRating / squad.length).toFixed(1)) : 0;

    return {
      name: teamName,
      slug: slugify(teamName),
      playersCount: squad.length,
      avgRating,
    };
  });

  // Sort teams alphabetically
  return teams.sort((a, b) => a.name.localeCompare(b.name));
}
