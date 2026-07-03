'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Player } from '@/lib/players';
import styles from './roster.module.css';
import PlayerImage from '@/app/components/PlayerImage';

interface RosterClientProps {
  initialPlayers: Player[];
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

export default function RosterClient({ initialPlayers }: RosterClientProps) {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleGroup, setSelectedRoleGroup] = useState('All');
  const [selectedBatting, setSelectedBatting] = useState('All');
  const [selectedBowling, setSelectedBowling] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(24);
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPlayer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPlayer]);

  // Dynamic filter options compiled from dataset
  const battingOptions = useMemo(() => {
    const stylesSet = new Set(initialPlayers.map(p => p.batting));
    return ['All', ...Array.from(stylesSet).filter(Boolean).sort()];
  }, [initialPlayers]);

  const bowlingOptions = useMemo(() => {
    const stylesSet = new Set(initialPlayers.map(p => p.bowling));
    return ['All', ...Array.from(stylesSet).filter(Boolean).sort()];
  }, [initialPlayers]);

  // Clean role matching groups
  const roleGroups = ['All', 'Batters', 'Bowlers', 'All Rounders', 'Wicketkeepers'];

  // Helper to categorize player role
  const isMatchRoleGroup = (playerRole: string, group: string) => {
    if (group === 'All') return true;
    const roleLower = playerRole.toLowerCase();
    if (group === 'Batters') return roleLower.includes('batter') && !roleLower.includes('keeper');
    if (group === 'Bowlers') return roleLower.includes('bowler');
    if (group === 'All Rounders') return roleLower.includes('all rounder');
    if (group === 'Wicketkeepers') return roleLower.includes('keeper');
    return false;
  };

  // Filtered & Sorted Players List
  const filteredAndSortedPlayers = useMemo(() => {
    return initialPlayers
      .filter(player => {
        // Name Search
        const matchesName = player.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Role Group Filter
        const matchesRoleGroup = isMatchRoleGroup(player.role, selectedRoleGroup);
        
        // Batting Style Filter
        const matchesBatting = selectedBatting === 'All' || player.batting === selectedBatting;
        
        // Bowling Style Filter
        const matchesBowling = selectedBowling === 'All' || player.bowling === selectedBowling;

        return matchesName && matchesRoleGroup && matchesBatting && matchesBowling;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        
        // Dynamic stat sorting
        const valA = (a as any)[sortBy] || 0;
        const valB = (b as any)[sortBy] || 0;
        return valB - valA; // Descending order for stats
      });
  }, [initialPlayers, searchQuery, selectedRoleGroup, selectedBatting, selectedBowling, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoleGroup('All');
    setSelectedBatting('All');
    setSelectedBowling('All');
    setSortBy('name');
    setVisibleCount(24);
  };

  // Get Role CSS Class and Short Tag
  const getRoleStyleInfo = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('keeper')) {
      return { className: 'role-keeper', tag: 'WK' };
    }
    if (roleLower.includes('all rounder')) {
      return { className: 'role-allrounder', tag: 'AR' };
    }
    if (roleLower.includes('bowler')) {
      return { className: 'role-bowler', tag: 'BOWL' };
    }
    return { className: 'role-batter', tag: 'BAT' };
  };

  // Get Initials for Player Avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get Progress Bar Color class based on value
  const getProgressBarClass = (value: number) => {
    if (value >= 80) return styles.fillCyan;
    if (value >= 70) return styles.fillEmerald;
    if (value >= 60) return styles.fillAmber;
    return styles.fillPurple;
  };

  const displayedPlayers = filteredAndSortedPlayers.slice(0, visibleCount);
  const hasMore = filteredAndSortedPlayers.length > visibleCount;

  return (
    <div>
      <div className={styles.rosterHeader}>
        <h1 className={styles.rosterTitle}>Player Roster</h1>
        <p className={styles.rosterSubtitle}>
          Browse complete ratings, batting positions, and bowling variations for the ranked cricket squad. Click any player card to inspect detailed technique, accuracy, and field positioning.
        </p>
      </div>

      {/* Interactive Filter Dashboard */}
      <div className={`${styles.filterDashboard} glass-card`}>
        <div className={styles.searchAndRoleRow}>
          <div className={styles.searchWrapper}>
            <svg 
              className={styles.searchIcon} 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search players by name..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24); // Reset pagination on search
              }}
            />
          </div>

          <div className={styles.roleFilterList}>
            {roleGroups.map(group => (
              <button
                key={group}
                className={`${styles.filterBtn} ${selectedRoleGroup === group ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setSelectedRoleGroup(group);
                  setVisibleCount(24); // Reset pagination
                }}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.secondaryRow}>
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Batting Style</label>
            <select
              className={styles.customSelect}
              value={selectedBatting}
              onChange={(e) => {
                setSelectedBatting(e.target.value);
                setVisibleCount(24);
              }}
            >
              {battingOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Batting Styles' : opt}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Bowling Variation</label>
            <select
              className={styles.customSelect}
              value={selectedBowling}
              onChange={(e) => {
                setSelectedBowling(e.target.value);
                setVisibleCount(24);
              }}
            >
              {bowlingOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Bowling Variations' : opt}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Sort By</label>
            <select
              className={styles.customSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="technique">Technique Rating</option>
              <option value="timing">Timing Rating</option>
              <option value="aggression">Aggression Rating</option>
              <option value="accuracy">Accuracy Rating</option>
              <option value="fielding">Fielding Rating</option>
            </select>
          </div>
        </div>

        <div className={styles.statsSummaryText}>
          <span>
            Showing {filteredAndSortedPlayers.length} of {initialPlayers.length} Cricket Players
          </span>
          {(searchQuery || selectedRoleGroup !== 'All' || selectedBatting !== 'All' || selectedBowling !== 'All' || sortBy !== 'name') && (
            <button className={styles.resetBtn} onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Roster Grid */}
      {displayedPlayers.length > 0 ? (
        <div className="responsive-grid">
          {displayedPlayers.map(player => {
            const roleInfo = getRoleStyleInfo(player.role);
            return (
              <div 
                key={player.name}
                className="glass-card glass-card-hover"
                onClick={() => setSelectedPlayer(player)}
              >
                <div className={styles.playerCard}>
                  <div>
                    <div className={styles.cardImageWrapper}>
                      <PlayerImage 
                        key={player.name}
                        name={player.name} 
                        width={300} 
                        height={300}
                        className={styles.cardImage}
                        priority={false}
                      />
                    </div>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatarNameGroup}>
                        <div className={styles.cardAvatar}>
                          <PlayerImage name={player.name} width={44} height={44} />
                        </div>
                        <div>
                          <h3 className={styles.playerName}>{player.name}</h3>
                        </div>
                      </div>
                      <span className={`role-badge ${roleInfo.className}`}>
                        {roleInfo.tag}
                      </span>
                    </div>

                    <div className={styles.cardStyles}>
                      <div className={styles.styleItem}>
                        <span>Role</span>
                        <span className={styles.styleVal}>{player.role}</span>
                      </div>
                      <div className={styles.styleItem}>
                        <span>Batting</span>
                        <span className={styles.styleVal}>{player.batting}</span>
                      </div>
                      {player.bowling !== 'None' && player.bowling !== '-' && (
                        <div className={styles.styleItem}>
                          <span>Bowling</span>
                          <span className={styles.styleVal}>{player.bowling}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardStatsPreview}>
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatVal}>{player.technique}%</span>
                      <span className={styles.previewStatLabel}>Tech</span>
                    </div>
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatVal}>{player.aggression}%</span>
                      <span className={styles.previewStatLabel}>Aggr</span>
                    </div>
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatVal}>{player.accuracy}%</span>
                      <span className={styles.previewStatLabel}>Acc</span>
                    </div>
                  </div>

                  <div className={styles.cardAction}>
                    <Link 
                      href={`/player/${slugify(player.name)}`} 
                      className={styles.viewMoreLink}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      View More &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card styles.noResultsCard" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Players Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            No players match the search criteria. Try modifying your filters or search keywords.
          </p>
          <button className={styles.filterBtn} onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Load More */}
      {hasMore && (
        <div className={styles.paginationContainer}>
          <button 
            className={styles.loadMoreBtn}
            onClick={() => setVisibleCount(prev => prev + 24)}
          >
            Load More Players
          </button>
          <span className={styles.showingText}>
            Showing {displayedPlayers.length} of {filteredAndSortedPlayers.length} matching players
          </span>
        </div>
      )}

      {/* Player Detailed Stats Modal */}
      {selectedPlayer && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setSelectedPlayer(null)}
        >
          <div 
            className="glass-card modalContent"
            style={{ 
              background: 'rgba(10, 11, 28, 0.9)', 
              maxWidth: '550px', 
              width: '100%', 
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()} // Stop propagation from closing modal
          >
            <button 
              className={styles.closeBtn}
              onClick={() => setSelectedPlayer(null)}
            >
              ✕
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {getInitials(selectedPlayer.name)}
              </div>
              <div>
                <h2 className={styles.modalPlayerName}>{selectedPlayer.name}</h2>
                <span className={`role-badge ${getRoleStyleInfo(selectedPlayer.role).className}`}>
                  {selectedPlayer.role}
                </span>
              </div>
            </div>

            <div className={styles.modalImageWrapper}>
              <PlayerImage 
                key={selectedPlayer.name}
                name={selectedPlayer.name} 
                width={500} 
                height={375}
                className={styles.modalImage}
              />
            </div>

            <div className={styles.modalMetaGrid}>
              <div>
                <div className={styles.metaLabel}>Batting Hand</div>
                <div className={styles.metaValue}>{selectedPlayer.batting}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Bowling Style</div>
                <div className={styles.metaValue}>{selectedPlayer.bowling || 'N/A'}</div>
              </div>
            </div>

            <div className={styles.statsDetailedSection}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                Performance Breakdown
              </h3>
              
              {[
                { label: 'Technique', key: 'technique' },
                { label: 'Timing', key: 'timing' },
                { label: 'Aggression', key: 'aggression' },
                { label: 'Movement', key: 'movement' },
                { label: 'Accuracy', key: 'accuracy' },
                { label: 'Fielding', key: 'fielding' }
              ].map(stat => {
                const val = (selectedPlayer as any)[stat.key] || 0;
                return (
                  <div key={stat.key} className={styles.statRow}>
                    <div className={styles.statRowHeader}>
                      <span className={styles.statRowLabel}>{stat.label}</span>
                      <span className={styles.statRowVal}>{val}%</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                      <div 
                        className={`${styles.progressBarFill} ${getProgressBarClass(val)}`}
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
