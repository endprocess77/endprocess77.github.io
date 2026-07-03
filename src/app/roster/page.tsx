import { getPlayers } from '@/lib/players';
import RosterClient from './RosterClient';

// Enable static parsing or dynamic on-request depending on build setup
export const dynamic = 'force-dynamic';

export default function RosterPage() {
  const players = getPlayers();

  return (
    <RosterClient initialPlayers={players} />
  );
}
