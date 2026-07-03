import { getTeams } from '@/lib/players';
import Link from 'next/link';
import styles from './teams.module.css';

export const metadata = {
  title: 'CricCeleb - Teams',
  description: 'View and analyze all twenty league teams, squad sizes, and overall ratings.',
};

export default function TeamsPage() {
  const teams = getTeams();

  return (
    <div className="layout-container" style={{ padding: '40px 20px' }}>
      <div className={styles.teamsHeader}>
        <h1 className={`${styles.teamsTitle} gradient-text`}>League Teams</h1>
        <p className={styles.teamsSubtitle}>
          Analyze team rosters, overall performance ratings, and squad configurations for all twenty competing league clubs.
        </p>
      </div>

      <div className={styles.teamsGrid}>
        {teams.map((team) => (
          <div key={team.slug} className={`${styles.teamCard} glass-card glass-card-hover`}>
            <div>
              <h2 className={styles.teamName}>{team.name}</h2>
              <div className={styles.teamDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Squad Size</span>
                  <span className={styles.detailValue}>{team.playersCount} Players</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Average Rating</span>
                  <span className={`${styles.detailValue} ${styles.ratingValue}`}>{team.avgRating}%</span>
                </div>
              </div>
            </div>
            
            <Link href={`/team/${team.slug}`} className={styles.viewTeamLink}>
              <span>View Team</span>
              <svg 
                className={styles.arrowIcon} 
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
          </div>
        ))}
      </div>
    </div>
  );
}
