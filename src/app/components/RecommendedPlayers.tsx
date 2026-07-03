'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PlayerImage from '@/app/components/PlayerImage';
import styles from '../player/[id]/player.module.css';

interface SimplePlayer {
  name: string;
  role: string;
  technique: number;
  aggression: number;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default function RecommendedPlayers({ candidates }: { candidates: SimplePlayer[] }) {
  const [recommendations, setRecommendations] = useState<SimplePlayer[]>([]);

  useEffect(() => {
    // Shuffle candidates on the client side to avoid hydration mismatch
    const shuffled = [...candidates]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    setRecommendations(shuffled);
  }, [candidates]);

  if (recommendations.length === 0) {
    return (
      <div className={styles.recommendationsGrid}>
        {candidates.slice(0, 4).map((simPlayer) => (
          <div key={simPlayer.name} className={`${styles.recCard} glass-card`} style={{ opacity: 0.5 }}>
            <div className={styles.recImageWrapper}>
              <div className={styles.recImage} style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
            </div>
            <div className={styles.recInfo}>
              <h3 className={styles.recName}>{simPlayer.name}</h3>
              <span className={styles.recRole}>{simPlayer.role}</span>
              <div className={styles.recStats}>
                <span>Tech: {simPlayer.technique}%</span>
                <span>Aggr: {simPlayer.aggression}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.recommendationsGrid}>
      {recommendations.map((simPlayer) => (
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
  );
}
