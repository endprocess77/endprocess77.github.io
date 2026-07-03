'use client';

import { useState, useMemo, useEffect } from 'react';
import { Player } from '@/lib/players';
import styles from './match.module.css';
import PlayerImage from '@/app/components/PlayerImage';

interface MatchClientProps {
  initialPlayers: Player[];
}

export default function MatchClient({ initialPlayers }: MatchClientProps) {
  // State for Teams
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  
  // State for search and filter in draft pool
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleGroup, setSelectedRoleGroup] = useState('All');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState<{ runs: number; wickets: number; overs: number } | null>(null);
  const [scoreB, setScoreB] = useState<{ runs: number; wickets: number; overs: number } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  // Role categorization groups
  const roleGroups = ['All', 'Batters', 'Bowlers', 'All Rounders', 'Wicketkeepers'];

  // helper for matching role groups
  const isMatchRoleGroup = (playerRole: string, group: string) => {
    if (group === 'All') return true;
    const roleLower = playerRole.toLowerCase();
    if (group === 'Batters') return roleLower.includes('batter') && !roleLower.includes('keeper');
    if (group === 'Bowlers') return roleLower.includes('bowler');
    if (group === 'All Rounders') return roleLower.includes('all rounder');
    if (group === 'Wicketkeepers') return roleLower.includes('keeper');
    return false;
  };

  // Draft Pool: players that are NOT selected in Team A or Team B
  const draftPool = useMemo(() => {
    const selectedNames = new Set([...teamA.map(p => p.name), ...teamB.map(p => p.name)]);
    return initialPlayers
      .filter(player => {
        const isNotSelected = !selectedNames.has(player.name);
        const matchesName = player.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = isMatchRoleGroup(player.role, selectedRoleGroup);
        return isNotSelected && matchesName && matchesRole;
      })
      .sort((a, b) => b.technique - a.technique); // Sort by technique by default
  }, [initialPlayers, teamA, teamB, searchQuery, selectedRoleGroup]);

  // Drafting actions
  const addToTeamA = (player: Player) => {
    if (teamA.length < 11) {
      setTeamA([...teamA, player]);
    }
  };

  const addToTeamB = (player: Player) => {
    if (teamB.length < 11) {
      setTeamB([...teamB, player]);
    }
  };

  const removeFromTeamA = (name: string) => {
    setTeamA(teamA.filter(p => p.name !== name));
  };

  const removeFromTeamB = (name: string) => {
    setTeamB(teamB.filter(p => p.name !== name));
  };

  // Team averages calculations
  const calculateAverages = (team: Player[]) => {
    if (team.length === 0) return { technique: 0, aggression: 0, accuracy: 0 };
    const len = team.length;
    return {
      technique: Math.round(team.reduce((sum, p) => sum + p.technique, 0) / len),
      aggression: Math.round(team.reduce((sum, p) => sum + p.aggression, 0) / len),
      accuracy: Math.round(team.reduce((sum, p) => sum + p.accuracy, 0) / len)
    };
  };

  const avgA = useMemo(() => calculateAverages(teamA), [teamA]);
  const avgB = useMemo(() => calculateAverages(teamB), [teamB]);

  // Balance checks
  const getTeamBalance = (team: Player[]) => {
    const hasKeeper = team.some(p => p.role.toLowerCase().includes('keeper'));
    const bowlersCount = team.filter(p => p.role.toLowerCase().includes('bowler')).length;
    const battersCount = team.filter(p => p.role.toLowerCase().includes('batter') && !p.role.toLowerCase().includes('keeper')).length;
    
    return {
      hasKeeper,
      bowlerDepth: bowlersCount >= 4,
      battingDepth: battersCount >= 5,
      bowlerCount: bowlersCount,
      batterCount: battersCount
    };
  };

  const balanceA = useMemo(() => getTeamBalance(teamA), [teamA]);
  const balanceB = useMemo(() => getTeamBalance(teamB), [teamB]);

  // Get Initials for Player Avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Match Simulation Engine (Ball-by-Ball)
  const runSimulation = () => {
    if (teamA.length !== 11 || teamB.length !== 11) return;
    
    setIsSimulating(true);
    setWinner(null);
    setSimulationLog(["Coin toss: Team A won the toss and elected to bat first!"]);
    setScoreA({ runs: 0, wickets: 0, overs: 0 });
    setScoreB(null);

    try {
      // Dynamic factors based on team averages
      const techA = avgA.technique;
      const aggrA = avgA.aggression;
      const accB = avgB.accuracy;

      const techB = avgB.technique;
      const aggrB = avgB.aggression;
      const accA = avgA.accuracy;

      let logLines: string[] = ["--- INNINGS 1: TEAM A BATTING ---"];
      let runsA = 0;
      let wicketsA = 0;
      let oversA = 0;

      // First Innings (Team A Bats)
      for (let ball = 1; ball <= 120; ball++) {
        if (wicketsA >= 10) {
          logLines.push("ALL OUT! Team A is bowled out.");
          break;
        }
        
        const currentOver = Math.floor((ball - 1) / 6);
        const currentBall = ((ball - 1) % 6) + 1;
        
        // Calculate outcome probability
        const runChance = Math.random() * 100 + (aggrA * 0.15) - (accB * 0.1);
        const wicketChance = Math.random() * 100 + (accB * 0.12) - (techA * 0.12);

        let event = "";
        if (wicketChance > 82) {
          wicketsA++;
          const batsman = teamA[Math.min(wicketsA, 10)].name;
          event = `${currentOver}.${currentBall}: OUT! ${batsman} is caught in the deep!`;
          logLines.push(event);
        } else {
          let runsScored = 0;
          if (runChance > 88) {
            runsScored = 6;
            event = `${currentOver}.${currentBall}: SIX! Magnificent shot cleared the ropes!`;
          } else if (runChance > 70) {
            runsScored = 4;
            event = `${currentOver}.${currentBall}: FOUR! Pierced the gap through covers.`;
          } else if (runChance > 40) {
            runsScored = 1 + (Math.random() > 0.6 ? 1 : 0); // 1 or 2 runs
            event = `${currentOver}.${currentBall}: Swept away for ${runsScored} run(s).`;
          } else {
            runsScored = 0;
            event = `${currentOver}.${currentBall}: Dot ball. Tight line from the bowler.`;
          }
          runsA += runsScored;
          if (runsScored === 4 || runsScored === 6 || Math.random() > 0.8) {
            logLines.push(event);
          }
        }
        oversA = parseFloat(`${currentOver}.${currentBall}`);
      }
      
      const target = runsA + 1;
      logLines.push(`--- INNINGS 1 ENDS: Team A scored ${runsA}/${wicketsA} ---`);
      logLines.push(`Target for Team B: ${target} runs in 20 overs.`);
      logLines.push("");
      logLines.push("--- INNINGS 2: TEAM B BATTING ---");

      let runsB = 0;
      let wicketsB = 0;
      let oversB = 0;

      // Second Innings (Team B Bats)
      for (let ball = 1; ball <= 120; ball++) {
        if (runsB >= target) {
          logLines.push("VICTORY! Team B chased down the target.");
          break;
        }
        if (wicketsB >= 10) {
          logLines.push("ALL OUT! Team B fell short of the target.");
          break;
        }

        const currentOver = Math.floor((ball - 1) / 6);
        const currentBall = ((ball - 1) % 6) + 1;

        const runChance = Math.random() * 100 + (aggrB * 0.15) - (accA * 0.1);
        const wicketChance = Math.random() * 100 + (accA * 0.12) - (techB * 0.12);

        let event = "";
        if (wicketChance > 82) {
          wicketsB++;
          const batsman = teamB[Math.min(wicketsB, 10)].name;
          event = `${currentOver}.${currentBall}: OUT! ${batsman} bowled clean! What a delivery.`;
          logLines.push(event);
        } else {
          let runsScored = 0;
          if (runChance > 88) {
            runsScored = 6;
            event = `${currentOver}.${currentBall}: SIX! Pulled high over mid-wicket!`;
          } else if (runChance > 70) {
            runsScored = 4;
            event = `${currentOver}.${currentBall}: FOUR! Flicked off the pads elegantly.`;
          } else if (runChance > 40) {
            runsScored = 1 + (Math.random() > 0.6 ? 1 : 0);
            event = `${currentOver}.${currentBall}: Controlled push to the outfield for ${runsScored}.`;
          } else {
            runsScored = 0;
            event = `${currentOver}.${currentBall}: Defensive block. Dot ball.`;
          }
          runsB += runsScored;
          if (runsScored === 4 || runsScored === 6 || Math.random() > 0.8) {
            logLines.push(event);
          }
        }
        oversB = parseFloat(`${currentOver}.${currentBall}`);
      }

      logLines.push(`--- INNINGS 2 ENDS: Team B scored ${runsB}/${wicketsB} ---`);

      // Determine Winner
      let result = "";
      if (runsB > runsA) {
        result = "Team B wins by " + (10 - wicketsB) + " wickets!";
      } else if (runsA > runsB) {
        result = "Team A wins by " + (runsA - runsB) + " runs!";
      } else {
        result = "Match tied! Thrilling finish.";
      }
      logLines.push(`=== MATCH COMPLETED: ${result} ===`);

      // Stream lines into log progressively for high-fidelity simulation effect
      let currentIdx = 0;
      let intervalId: any = null;
      intervalId = setInterval(() => {
        try {
          if (currentIdx < logLines.length) {
            setSimulationLog(prev => [...prev, logLines[currentIdx]]);
            
            // Progressively update score outputs for indicators
            if (logLines[currentIdx].includes("INNINGS 1 ENDS")) {
              setScoreA({ runs: runsA, wickets: wicketsA, overs: 20 });
              setScoreB({ runs: 0, wickets: 0, overs: 0 });
            }
            if (logLines[currentIdx].includes("INNINGS 2 ENDS") || logLines[currentIdx].includes("VICTORY")) {
              setScoreB({ runs: runsB, wickets: wicketsB, overs: Math.min(20, oversB) });
            }
            
            currentIdx++;
          } else {
            if (intervalId) clearInterval(intervalId);
            setIsSimulating(false);
            setScoreA({ runs: runsA, wickets: wicketsA, overs: Math.min(20, oversA) });
            setScoreB({ runs: runsB, wickets: wicketsB, overs: Math.min(20, oversB) });
            setWinner(runsB > runsA ? "Team B" : runsA > runsB ? "Team A" : "Tie");
          }
        } catch (err: any) {
          if (intervalId) clearInterval(intervalId);
          setIsSimulating(false);
          setSimulationLog(prev => [...prev, `[SIMULATION ERROR]: ${err.message || err}`]);
          console.error("Simulation interval error:", err);
        }
      }, 150); // Fast progressive display
    } catch (err: any) {
      setIsSimulating(false);
      setSimulationLog([`[SIMULATION ERROR]: ${err.message || err}`]);
      console.error("Simulation loop error:", err);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Match Draft</h1>
        <p className={styles.subtitle}>
          Draft two distinct elevens from your ranked roster pool. Compare team strength averages, analyze squad balance, and run a live ball-by-ball simulated match!
        </p>
      </div>

      <div className={styles.workspaceGrid}>
        {/* Team A (Left Column) */}
        <div className={`${styles.teamColumn} glass-card`}>
          <div className={styles.teamHeader}>
            <h2 className={styles.teamName} style={{ color: '#60a5fa' }}>Team A</h2>
            <div className={styles.teamCount}>{teamA.length} / 11 Players</div>
          </div>
          
          <div className={styles.slotsList}>
            {Array.from({ length: 11 }).map((_, idx) => {
              const player = teamA[idx];
              if (player) {
                return (
                  <div key={player.name} className={styles.filledSlot}>
                    <div className={styles.playerInfo}>
                      <div className={styles.playerAvatar}>
                        <PlayerImage name={player.name} width={32} height={32} />
                      </div>
                      <div className={styles.playerNameRole}>
                        <span className={styles.playerName}>{player.name}</span>
                        <span className={styles.playerRole}>{player.role}</span>
                      </div>
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeFromTeamA(player.name)}
                      title="Remove player"
                    >
                      ✕
                    </button>
                  </div>
                );
              }
              return (
                <div key={`empty-a-${idx}`} className={styles.emptySlot}>
                  + Slot {idx + 1} Available
                </div>
              );
            })}
          </div>
        </div>

        {/* Draft Pool Selector (Middle Column) */}
        <div className={`${styles.draftPool} glass-card`}>
          <div className={styles.poolHeader}>
            <h2 className={styles.poolTitle}>Draft Selection Pool</h2>
            <input 
              type="text" 
              placeholder="Search available players..." 
              className={styles.searchBox}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={styles.roleFilterPills}>
              {roleGroups.map(group => (
                <button
                  key={group}
                  className={`${styles.filterPill} ${selectedRoleGroup === group ? styles.filterPillActive : ''}`}
                  onClick={() => setSelectedRoleGroup(group)}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scrollablePoolList}>
            {draftPool.length > 0 ? (
              draftPool.map(player => (
                <div key={player.name} className={styles.poolPlayerRow}>
                  <div className={styles.playerInfo}>
                    <div className={styles.playerNameRole}>
                      <span className={styles.playerName} style={{ fontSize: '13px' }}>{player.name}</span>
                      <span className={styles.playerRole} style={{ fontSize: '10px' }}>{player.role} (Tech: {player.technique}%)</span>
                    </div>
                  </div>
                  <div className={styles.draftActionGroup}>
                    <button
                      className={`${styles.draftBtn} ${styles.draftBtnA}`}
                      onClick={() => addToTeamA(player)}
                      disabled={teamA.length >= 11}
                    >
                      + Team A
                    </button>
                    <button
                      className={`${styles.draftBtn} ${styles.draftBtnB}`}
                      onClick={() => addToTeamB(player)}
                      disabled={teamB.length >= 11}
                    >
                      + Team B
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No draftable players match filters.
              </div>
            )}
          </div>
        </div>

        {/* Team B (Right Column) */}
        <div className={`${styles.teamColumn} glass-card`}>
          <div className={styles.teamHeader}>
            <h2 className={styles.teamName} style={{ color: '#c084fc' }}>Team B</h2>
            <div className={styles.teamCount}>{teamB.length} / 11 Players</div>
          </div>
          
          <div className={styles.slotsList}>
            {Array.from({ length: 11 }).map((_, idx) => {
              const player = teamB[idx];
              if (player) {
                return (
                  <div key={player.name} className={styles.filledSlot}>
                    <div className={styles.playerInfo}>
                      <div className={styles.playerAvatar}>
                        <PlayerImage name={player.name} width={32} height={32} />
                      </div>
                      <div className={styles.playerNameRole}>
                        <span className={styles.playerName}>{player.name}</span>
                        <span className={styles.playerRole}>{player.role}</span>
                      </div>
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeFromTeamB(player.name)}
                      title="Remove player"
                    >
                      ✕
                    </button>
                  </div>
                );
              }
              return (
                <div key={`empty-b-${idx}`} className={styles.emptySlot}>
                  + Slot {idx + 1} Available
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparisons Dashboard */}
      {(teamA.length > 0 || teamB.length > 0) && (
        <div className={`${styles.comparisonDashboard} glass-card`}>
          <h2 className={styles.compTitle}>Team Strengths Comparison</h2>
          <div className={styles.metricsGrid}>
            {[
              { label: 'Average Technique', key: 'technique', colorA: '#60a5fa', colorB: '#c084fc' },
              { label: 'Average Aggression', key: 'aggression', colorA: '#60a5fa', colorB: '#c084fc' },
              { label: 'Average Accuracy', key: 'accuracy', colorA: '#60a5fa', colorB: '#c084fc' }
            ].map(metric => {
              const valA = (avgA as any)[metric.key];
              const valB = (avgB as any)[metric.key];
              const total = (valA + valB) || 1;
              const pctA = Math.round((valA / total) * 100);
              const pctB = 100 - pctA;

              return (
                <div key={metric.key} className={styles.metricRow}>
                  <label className={styles.metricLabel}>{metric.label}</label>
                  <div className={styles.compareSliderWrapper}>
                    <span className={`${styles.teamValueText} ${styles.teamAValueText}`}>{valA}%</span>
                    <div className={styles.comparisonSliderContainer}>
                      <div className={styles.teamABar} style={{ width: `${pctA}%` }}></div>
                      <div className={styles.teamBBar} style={{ width: `${pctB}%` }}></div>
                    </div>
                    <span className={`${styles.teamValueText} ${styles.teamBValueText}`}>{valB}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.balancesSection}>
            {/* Team A Balance Check */}
            <div className={styles.teamBalanceCard}>
              <h3 className={`${styles.balanceHeading} ${styles.balanceAHeading}`}>Team A Balance Status</h3>
              <div className={styles.balanceItem}>
                {balanceA.hasKeeper ? (
                  <span className={styles.balanceIconCheck}>✓ Wicketkeeper Selected</span>
                ) : (
                  <span className={styles.balanceIconAlert}>⚠ No Wicketkeeper (WK) Selected</span>
                )}
              </div>
              <div className={styles.balanceItem}>
                {balanceA.bowlerDepth ? (
                  <span className={styles.balanceIconCheck}>✓ Bowler Depth Satisfied ({balanceA.bowlerCount} Bowlers)</span>
                ) : (
                  <span className={styles.balanceIconAlert}>⚠ Weak Bowling (Need at least 4 bowlers, current: {balanceA.bowlerCount})</span>
                )}
              </div>
            </div>

            {/* Team B Balance Check */}
            <div className={styles.teamBalanceCard}>
              <h3 className={`${styles.balanceHeading} ${styles.balanceBHeading}`}>Team B Balance Status</h3>
              <div className={styles.balanceItem}>
                {balanceB.hasKeeper ? (
                  <span className={styles.balanceIconCheck}>✓ Wicketkeeper Selected</span>
                ) : (
                  <span className={styles.balanceIconAlert}>⚠ No Wicketkeeper (WK) Selected</span>
                )}
              </div>
              <div className={styles.balanceItem}>
                {balanceB.bowlerDepth ? (
                  <span className={styles.balanceIconCheck}>✓ Bowler Depth Satisfied ({balanceB.bowlerCount} Bowlers)</span>
                ) : (
                  <span className={styles.balanceIconAlert}>⚠ Weak Bowling (Need at least 4 bowlers, current: {balanceB.bowlerCount})</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Section */}
      <div className={styles.simulatorSection}>
        <button
          className={styles.simulateBtn}
          disabled={teamA.length !== 11 || teamB.length !== 11 || isSimulating}
          onClick={runSimulation}
        >
          {isSimulating ? 'Playing Match...' : 'Simulate Match'}
        </button>

        {/* Commentary Box Overlay */}
        {(scoreA || scoreB || simulationLog.length > 0) && (
          <div className={`${styles.simulatorConsole} glass-card`}>
            <div className={styles.scoreboard}>
              <div className={styles.scoreBox} style={{ color: '#60a5fa' }}>
                <span className={styles.scoreTeamName}>Team A</span>
                <span className={styles.scoreVal}>{scoreA?.runs ?? 0}/{scoreA?.wickets ?? 0}</span>
                <span className={styles.scoreOvers}>{scoreA?.overs ?? 0} / 20 overs</span>
              </div>
              <div className={styles.vsCircle}>VS</div>
              <div className={styles.scoreBox} style={{ color: '#c084fc' }}>
                <span className={styles.scoreTeamName}>Team B</span>
                <span className={styles.scoreVal}>{scoreB?.runs ?? 0}/{scoreB?.wickets ?? 0}</span>
                <span className={styles.scoreOvers}>{scoreB?.overs ?? 0} / 20 overs</span>
              </div>
            </div>

            {winner && (
              <div className={styles.winnerAlertBanner}>
                {winner === 'Tie' ? 'Match Tied!' : `Winner: ${winner} 🎉`}
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <div className={styles.commentaryTitle}>Ball-by-Ball Commentary</div>
              <div className={styles.commentaryWrapper}>
                {simulationLog.map((line, idx) => {
                  let lineClass = styles.commentaryLine;
                  if (line.includes("OUT!")) lineClass += ` ${styles.commentaryWicket}`;
                  if (line.includes("SIX!") || line.includes("FOUR!")) lineClass += ` ${styles.commentaryBoundary}`;
                  return (
                    <p key={idx} className={lineClass}>
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
