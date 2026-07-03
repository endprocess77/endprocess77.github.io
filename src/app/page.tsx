import Link from 'next/link';
import { getPlayers } from '@/lib/players';
import styles from './home.module.css';

export default function Home() {
  const players = getPlayers();
  const totalPlayers = players.length;

  // Calculate role counts
  const batterCount = players.filter(p => p.role.toLowerCase().includes('batter') && !p.role.toLowerCase().includes('keeper')).length;
  const bowlerCount = players.filter(p => p.role.toLowerCase().includes('bowler')).length;
  const allRounderCount = players.filter(p => p.role.toLowerCase().includes('all rounder')).length;
  const keeperCount = players.filter(p => p.role.toLowerCase().includes('keeper')).length;

  return (
    <div>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          The Ultimate <span className="gradient-text">Cricket Roster</span> Dashboard
        </h1>
        <p className={styles.heroSubtitle}>
          Analyze player statistics, compare techniques, and draft your dream squad from our database of top-ranked cricket players.
        </p>
        <Link href="/roster" className={styles.ctaButton}>
          <span>Explore Player Roster</span>
          <svg 
            className={styles.ctaArrow} 
            width="16" 
            height="16" 
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
      </section>

      <section className={styles.statsSection}>
        <h2 className={styles.statsTitle}>League Summary Metrics</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <div className={`${styles.statCard} glass-card`} style={{ maxWidth: '360px', width: '100%' }}>
            <div className={`${styles.statValue} gradient-text`}>{totalPlayers}</div>
            <div className={styles.statLabel}>Total Ranked Players</div>
          </div>
        </div>

        <h2 className={styles.statsTitle}>Squad Distribution by Role</h2>
        <div className={styles.rolesGrid}>
          <div className={`${styles.roleCard} glass-card`}>
            <div className={styles.roleHeader}>
              <span className={styles.roleLabel}>Batters</span>
              <span className="role-badge role-batter">Bat</span>
            </div>
            <div className={styles.roleCount}>{batterCount}</div>
            <div className={styles.rolePercentage}>
              {((batterCount / totalPlayers) * 100).toFixed(1)}% of Roster
            </div>
          </div>

          <div className={`${styles.roleCard} glass-card`}>
            <div className={styles.roleHeader}>
              <span className={styles.roleLabel}>Bowlers</span>
              <span className="role-badge role-bowler">Bowl</span>
            </div>
            <div className={styles.roleCount}>{bowlerCount}</div>
            <div className={styles.rolePercentage}>
              {((bowlerCount / totalPlayers) * 100).toFixed(1)}% of Roster
            </div>
          </div>

          <div className={`${styles.roleCard} glass-card`}>
            <div className={styles.roleHeader}>
              <span className={styles.roleLabel}>All Rounders</span>
              <span className="role-badge role-allrounder">AR</span>
            </div>
            <div className={styles.roleCount}>{allRounderCount}</div>
            <div className={styles.rolePercentage}>
              {((allRounderCount / totalPlayers) * 100).toFixed(1)}% of Roster
            </div>
          </div>

          <div className={`${styles.roleCard} glass-card`}>
            <div className={styles.roleHeader}>
              <span className={styles.roleLabel}>Wicketkeepers</span>
              <span className="role-badge role-keeper">WK</span>
            </div>
            <div className={styles.roleCount}>{keeperCount}</div>
            <div className={styles.rolePercentage}>
              {((keeperCount / totalPlayers) * 100).toFixed(1)}% of Roster
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
