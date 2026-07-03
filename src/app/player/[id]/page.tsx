import { getPlayers, Player } from '@/lib/players';
import Link from 'next/link';
import PlayerImage from '@/app/components/PlayerImage';
import styles from './player.module.css';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function generatePlayerBio(player: Player): string {
  const name = player.name;
  const role = player.role;
  const batting = player.batting.toLowerCase();
  const bowling = player.bowling && player.bowling !== 'None' && player.bowling !== '-' ? player.bowling.toLowerCase() : null;

  const attributes = [
    { key: 'technique', label: 'Technique', val: player.technique, desc: 'exhibits superb technical prowess and clean mechanics' },
    { key: 'timing', label: 'Timing', val: player.timing, desc: 'is celebrated for exquisite timing and natural flow' },
    { key: 'aggression', label: 'Aggression', val: player.aggression, desc: 'brings raw power, intent, and high-octane aggression' },
    { key: 'movement', label: 'Movement', val: player.movement, desc: 'extracts excellent movement and shows incredible agility' },
    { key: 'accuracy', label: 'Accuracy', val: player.accuracy, desc: 'boasts exceptional consistency, command, and precision' },
    { key: 'fielding', label: 'Fielding', val: player.fielding, desc: 'stands out for sharp reflexes and outstanding work in the field' },
  ];

  const sorted = [...attributes].sort((a, b) => b.val - a.val);
  const primary = sorted[0];
  const secondary = sorted[1];

  let bio = `${name} is a competitive ${role.toLowerCase()}. `;
  
  if (bowling) {
    bio += `Operating as a ${batting} batsman and bowling ${bowling}, they bring a balanced skill set to the team. `;
  } else {
    bio += `As a dedicated ${batting} player, they focus on anchoring the lineup and contributing in key phases of the game. `;
  }

  bio += `On the field, ${name} ${primary.desc} (rated at ${primary.val}%), which is their most defining characteristic. `;
  bio += `This is complemented by a strong rating in ${secondary.label} (${secondary.val}%), making them a versatile team member who can adapt to varying match conditions.`;

  return bio;
}

export function generateStaticParams() {
  const players = getPlayers();
  return players.map((player) => ({
    id: slugify(player.name),
  }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const players = getPlayers();
  const player = players.find((p) => slugify(p.name) === id);

  if (!player) {
    return (
      <div className="layout-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 className="gradient-text">Player Not Found</h1>
        <p style={{ color: '#94a3b8', margin: '16px 0 32px' }}>The player you are looking for does not exist in our roster.</p>
        <Link href="/roster" className="logo-link" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px' }}>
          Back to Roster
        </Link>
      </div>
    );
  }

  // Get 4 random players of the same role (shuffled)
  const sameRolePlayers = players.filter((p) => p.name !== player.name && p.role === player.role);
  const similarPlayers = [...sameRolePlayers]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const stats = [
    { label: 'Technique', value: player.technique, color: '#f43f5e' },
    { label: 'Timing', value: player.timing, color: '#ec4899' },
    { label: 'Aggression', value: player.aggression, color: '#d946ef' },
    { label: 'Movement', value: player.movement, color: '#3b82f6' },
    { label: 'Accuracy', value: player.accuracy, color: '#06b6d4' },
    { label: 'Fielding', value: player.fielding, color: '#10b981' },
  ];

  return (
    <div className={styles.profileContainer}>
      <div className={styles.backNav}>
        <Link href="/roster" className={styles.backLink}>
          &larr; Back to Roster
        </Link>
      </div>

      {/* Hero section */}
      <div className={`${styles.profileHero} glass-card`}>
        <div className={styles.heroLayout}>
          <div className={styles.heroImageWrapper}>
            <PlayerImage 
              name={player.name} 
              width={240} 
              height={240} 
              className={styles.heroImage}
              priority={true}
            />
          </div>
          <div className={styles.heroDetails}>
            <span className={styles.roleTag}>{player.role}</span>
            <h1 className={styles.playerName}>{player.name}</h1>
            
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Batting Hand</span>
                <span className={styles.metaVal}>{player.batting}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Bowling Style</span>
                <span className={styles.metaVal}>{player.bowling || 'N/A'}</span>
              </div>
            </div>

            <p className={styles.playerBio}>
              {generatePlayerBio(player)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats display */}
      <div className={styles.sectionTitle}>Performance Breakdown</div>
      <div className={`${styles.statsGrid} glass-card`}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statRow}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}%</span>
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

      {/* Similar players recommendations */}
      <div className={styles.sectionTitle}>Similar & Recommended Players</div>
      <div className={styles.recommendationsGrid}>
        {similarPlayers.map((simPlayer) => (
          <Link 
            key={simPlayer.name} 
            href={`/player/${slugify(simPlayer.name)}`}
            className={`${styles.recCard} glass-card glass-card-hover`}
          >
            <div className={styles.recImageWrapper}>
              <PlayerImage name={simPlayer.name} width={80} height={80} className={styles.recImage} />
            </div>
            <div className={styles.recInfo}>
              <h3 className={styles.recName}>{simPlayer.name}</h3>
              <span className={styles.recRole}>{simPlayer.role}</span>
              <div className={styles.recStats}>
                <span>Tech: {simPlayer.technique}%</span>
                <span>Aggr: {simPlayer.aggression}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
