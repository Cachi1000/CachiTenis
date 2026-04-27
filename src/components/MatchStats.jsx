import React from 'react';

const MatchStats = ({ state }) => {
  const { config, stats, sets } = state;
  const p1Stats = stats.player1;
  const p2Stats = stats.player2;

  const getPercentage = (part, total) => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const StatRow = ({ label, val1, val2, highlightHighest }) => {
    const v1Num = parseFloat(val1) || 0;
    const v2Num = parseFloat(val2) || 0;
    
    let w1 = 'normal';
    let w2 = 'normal';
    let c1 = 'var(--text-main)';
    let c2 = 'var(--text-main)';

    if (highlightHighest) {
      if (v1Num > v2Num) { w1 = 'bold'; c1 = 'var(--primary)'; }
      if (v2Num > v1Num) { w2 = 'bold'; c2 = 'var(--primary)'; }
    }

    return (
      <tr>
        <td style={{ fontWeight: w1, color: c1, width: '25%', textAlign: 'center' }}>{val1}</td>
        <td style={{ width: '50%' }}>{label}</td>
        <td style={{ fontWeight: w2, color: c2, width: '25%', textAlign: 'center' }}>{val2}</td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Match Statistics</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--primary)' }}>{config.player1Name}</span>
          <span style={{ color: 'var(--text-muted)' }}>vs</span>
          <span style={{ color: 'var(--secondary)' }}>{config.player2Name}</span>
        </div>
      </div>

      <div className="scoreboard" style={{ marginBottom: '2rem' }}>
        <div className="scoreboard-row">
          <div className="player-info">
            <div className="player-name">{config.player1Name}</div>
          </div>
          <div style={{ display: 'flex' }}>
            {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem' }}>{set.player1}</div>)}
          </div>
        </div>
        <div className="scoreboard-row">
          <div className="player-info">
            <div className="player-name">{config.player2Name}</div>
          </div>
          <div style={{ display: 'flex' }}>
            {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem' }}>{set.player2}</div>)}
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="stats-table">
          <tbody>
            <StatRow 
              label="Aces" 
              val1={p1Stats.aces} 
              val2={p2Stats.aces} 
              highlightHighest={true} 
            />
            <StatRow 
              label="Double Faults" 
              val1={p1Stats.doubleFaults} 
              val2={p2Stats.doubleFaults} 
              highlightHighest={false} 
            />
            <StatRow 
              label="1st Serve %" 
              val1={`${p1Stats.firstServesIn}/${p1Stats.firstServesTotal} (${getPercentage(p1Stats.firstServesIn, p1Stats.firstServesTotal)})`} 
              val2={`${p2Stats.firstServesIn}/${p2Stats.firstServesTotal} (${getPercentage(p2Stats.firstServesIn, p2Stats.firstServesTotal)})`} 
            />
            <StatRow 
              label="Winners" 
              val1={p1Stats.winners} 
              val2={p2Stats.winners} 
              highlightHighest={true} 
            />
            <StatRow 
              label="Unforced Errors" 
              val1={p1Stats.unforcedErrors} 
              val2={p2Stats.unforcedErrors} 
              highlightHighest={false} 
            />
            <StatRow 
              label="Forced Errors" 
              val1={p1Stats.forcedErrors} 
              val2={p2Stats.forcedErrors} 
              highlightHighest={false} 
            />
            <StatRow 
              label="Total Points Won" 
              val1={p1Stats.pointsWon} 
              val2={p2Stats.pointsWon} 
              highlightHighest={true} 
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchStats;
