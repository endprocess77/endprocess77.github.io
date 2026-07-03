import { getPlayers, getTeams, slugify } from '@/lib/players';
import Link from 'next/link';
import PlayerImage from '@/app/components/PlayerImage';
import TeamLogo from '@/app/components/TeamLogo';
import styles from './team.module.css';

export function generateStaticParams() {
  const teams = getTeams();
  return teams.map((team) => ({
    id: team.slug,
  }));
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teams = getTeams();
  const team = teams.find((t) => t.slug === id);

  if (!team) {
    return (
      <div className="layout-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 className="gradient-text">Team Not Found</h1>
        <p style={{ color: '#94a3b8', margin: '16px 0 32px' }}>The team you are looking for does not exist in our league.</p>
        <Link href="/teams" className="logo-link" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px' }}>
          Back to Teams
        </Link>
      </div>
    );
  }

  // Get players for this team
  const players = getPlayers().filter((p) => slugify(p.team) === id);
  const count = players.length;

  // Calculate average rating of team for each stat
  const avgStats = {
    technique: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.technique, 0) / count) : 0,
    timing: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.timing, 0) / count) : 0,
    aggression: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.aggression, 0) / count) : 0,
    movement: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.movement, 0) / count) : 0,
    accuracy: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.accuracy, 0) / count) : 0,
    fielding: count > 0 ? Math.round(players.reduce((sum, p) => sum + p.fielding, 0) / count) : 0,
  };

  const statBars = [
    { label: 'Technique', value: avgStats.technique, color: '#f43f5e' },
    { label: 'Timing', value: avgStats.timing, color: '#ec4899' },
    { label: 'Aggression', value: avgStats.aggression, color: '#d946ef' },
    { label: 'Movement', value: avgStats.movement, color: '#3b82f6' },
    { label: 'Accuracy', value: avgStats.accuracy, color: '#06b6d4' },
    { label: 'Fielding', value: avgStats.fielding, color: '#10b981' },
  ];

  // Group squad by generic role
  const batters = players.filter((p) => p.role.includes('Batter') && !p.role.includes('Keeper') && !p.role.includes('All Rounder'));
  const wicketkeepers = players.filter((p) => p.role.includes('Keeper'));
  const allRounders = players.filter((p) => p.role.includes('All Rounder'));
  const bowlers = players.filter((p) => p.role.includes('Bowler'));

  const groups = [
    { name: 'Batters', players: batters },
    { name: 'Wicketkeepers', players: wicketkeepers },
    { name: 'All Rounders', players: allRounders },
    { name: 'Bowlers', players: bowlers },
  ].filter((g) => g.players.length > 0);

  // Helper to calculate overall rating of individual player
  const getOverallRating = (p: typeof players[0]) => {
    return Math.round((p.technique + p.timing + p.aggression + p.movement + p.accuracy + p.fielding) / 6);
  };

  return (
    <div className={styles.teamContainer}>
      <div className={styles.backNav}>
        <Link href="/teams" className={styles.backLink}>
          &larr; Back to Teams
        </Link>
      </div>

      {/* Hero Banner */}
      <div className={`${styles.teamHero} glass-card`}>
        <div className={styles.heroLayout}>
          <div className={styles.heroHeaderSection}>
            <TeamLogo slug={team.slug} name={team.name} width={80} height={80} className={styles.teamHeroLogo} />
            <div className={styles.heroDetails}>
              <span className={styles.teamMeta}>League Competitor</span>
              <h1 className={styles.teamName}>{team.name}</h1>
            </div>
          </div>
          <div className={styles.overallRatingBox}>
            <span className={styles.overallRatingVal}>{team.avgRating}%</span>
            <span className={styles.overallRatingLabel}>Team Rating</span>
          </div>
        </div>
      </div>

      {/* Team Average Stats */}
      <div className={styles.sectionTitle}>Squad Average Attributes</div>
      <div className={`${styles.statsGrid} glass-card`}>
        {statBars.map((stat) => (
          <div key={stat.label} className={styles.statRow}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={stat.label}>{stat.value}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div 
                className={styles.progressBarFill} 
                style={{ 
                  width: `${stat.value}%`, 
                  background: stat.color,
                  boxShadow: `0 0 10px ${stat.color}40`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Roster Squad List */}
      <div className={styles.sectionTitle}>Active Squad List ({count} Players)</div>
      {groups.map((group) => (
        <div key={group.name} className={styles.roleGroup}>
          <h2 className={styles.roleGroupTitle}>
            <span>{group.name}</span>
            <span className={styles.roleCountBadge}>{group.players.length}</span>
          </h2>
          <div className={styles.squadGrid}>
            {group.players.map((p) => (
              <div key={p.name} className={`${styles.playerCard} glass-card`}>
                <div className={styles.playerImageWrapper}>
                  <PlayerImage name={p.name} width={64} height={64} className={styles.playerImage} />
                </div>
                <div className={styles.playerDetails}>
                  <h3 className={styles.playerName}>{p.name}</h3>
                  <div className={styles.playerMetaRow}>
                    <span className={styles.playerRating}>{getOverallRating(p)}% OVR</span>
                    <span className={styles.playerStances}>
                      {p.batting.replace(' Hand', 'H')} / {p.bowling === 'N/A' || p.bowling === '-' ? 'No Bowl' : p.bowling.replace('Slow Left Arm ', 'SLA ').replace('Right Arm ', 'RA ').replace('Left Arm ', 'LA ')}
                    </span>
                  </div>
                  <Link href={`/player/${slugify(p.name)}`} className={styles.profileLink}>
                    <span>View Profile</span>
                    <svg 
                      className={styles.profileArrow} 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
