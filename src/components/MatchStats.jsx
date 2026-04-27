import React from 'react';

const MatchStats = ({ state }) => {
  const { config, stats, sets } = state;

  const getPercentage = (part, total) => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const getTeamStats = (p1, p2) => {
    if (!config.isDoubles) return p1;
    return {
      aces: p1.aces + p2.aces,
      doubleFaults: p1.doubleFaults + p2.doubleFaults,
      firstServesIn: p1.firstServesIn + p2.firstServesIn,
      firstServesTotal: p1.firstServesTotal + p2.firstServesTotal,
      winners: p1.winners + p2.winners,
      unforcedErrors: p1.unforcedErrors + p2.unforcedErrors,
      forcedErrors: p1.forcedErrors + p2.forcedErrors,
      pointsWon: p1.pointsWon // Already represents team points
    };
  };

  const t1Stats = getTeamStats(stats.player1, stats.player3);
  const t2Stats = getTeamStats(stats.player2, stats.player4);

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

  const StatsTable = ({ s1, s2, title, hidePoints }) => (
    <div style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>{title}</h3>}
      <div style={{ overflowX: 'auto' }}>
        <table className="stats-table">
          <tbody>
            <StatRow label="Aces" val1={s1.aces} val2={s2.aces} highlightHighest={true} />
            <StatRow label="Double Faults" val1={s1.doubleFaults} val2={s2.doubleFaults} highlightHighest={false} />
            <StatRow 
              label="1st Serve %" 
              val1={`${s1.firstServesIn}/${s1.firstServesTotal} (${getPercentage(s1.firstServesIn, s1.firstServesTotal)})`} 
              val2={`${s2.firstServesIn}/${s2.firstServesTotal} (${getPercentage(s2.firstServesIn, s2.firstServesTotal)})`} 
            />
            <StatRow label="Winners" val1={s1.winners} val2={s2.winners} highlightHighest={true} />
            <StatRow label="Unforced Errors" val1={s1.unforcedErrors} val2={s2.unforcedErrors} highlightHighest={false} />
            <StatRow label="Forced Errors" val1={s1.forcedErrors} val2={s2.forcedErrors} highlightHighest={false} />
            {!hidePoints && <StatRow label="Total Points Won" val1={s1.pointsWon} val2={s2.pointsWon} highlightHighest={true} />}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Match Statistics</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '1.25rem', fontWeight: 'bold', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--primary)', textAlign: 'right' }}>
            {config.player1Name} {config.isDoubles && <><br/><span style={{fontSize: '0.9rem'}}>& {config.player3Name}</span></>}
          </span>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>vs</span>
          <span style={{ color: 'var(--secondary)', textAlign: 'left' }}>
            {config.player2Name} {config.isDoubles && <><br/><span style={{fontSize: '0.9rem'}}>& {config.player4Name}</span></>}
          </span>
        </div>
      </div>

      <div className="scoreboard" style={{ marginBottom: '2rem' }}>
        <div className="scoreboard-row">
          <div className="player-info">
            <div className="player-name">
              {config.player1Name}
              {config.isDoubles && <><br/><span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>{config.player3Name}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem' }}>{set.player1}</div>)}
          </div>
        </div>
        <div className="scoreboard-row">
          <div className="player-info">
            <div className="player-name">
              {config.player2Name}
              {config.isDoubles && <><br/><span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>{config.player4Name}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem' }}>{set.player2}</div>)}
          </div>
        </div>
      </div>

      <StatsTable s1={t1Stats} s2={t2Stats} title={config.isDoubles ? "Team Statistics" : null} />
      
      {config.isDoubles && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Individual Statistics</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', padding: '0 1rem' }}>
            <span style={{ color: 'var(--primary)' }}>{config.player1Name}</span>
            <span style={{ color: 'var(--secondary)' }}>{config.player2Name}</span>
          </div>
          <StatsTable s1={stats.player1} s2={stats.player2} hidePoints={true} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', padding: '0 1rem', marginTop: '1rem' }}>
            <span style={{ color: 'var(--primary)' }}>{config.player3Name}</span>
            <span style={{ color: 'var(--secondary)' }}>{config.player4Name}</span>
          </div>
          <StatsTable s1={stats.player3} s2={stats.player4} hidePoints={true} />
        </div>
      )}
    </div>
  );
};

export default MatchStats;
