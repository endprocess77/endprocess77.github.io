import { getPlayers } from '@/lib/players';
import RosterClient from './RosterClient';

// Enable static site generation for static hosting like GitHub Pages

export default function RosterPage() {
  const players = getPlayers();

  return (
    <RosterClient initialPlayers={players} />
  );
}
