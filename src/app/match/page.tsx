import { getPlayers } from '@/lib/players';
import MatchClient from './MatchClient';

export default function MatchPage() {
  const players = getPlayers();

  return (
    <MatchClient initialPlayers={players} />
  );
}
