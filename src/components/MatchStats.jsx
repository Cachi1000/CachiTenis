import React, { useState } from 'react';
import { Clock, BarChart2, List, TrendingUp } from 'lucide-react';

const MatchStats = ({ state }) => {
  const { config, stats, sets, pointLog } = state;
  const [activeTab, setActiveTab] = useState('ESSENTIAL');

  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatRallyTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}'${secs.toString().padStart(2, '0')}`;
  };

  const getPercentage = (part, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const calculateExtendedStats = (teamId) => {
    const playerIds = teamId === 1 ? [1, 3] : [2, 4];
    const teamStats = {
      aces: 0, doubleFaults: 0, winners: 0, unforcedErrors: 0, forcedErrors: 0,
      firstServesIn: 0, firstServesTotal: 0, secondServesIn: 0, secondServesTotal: 0,
      pointsWon: 0, breakPointsWon: 0, breakPointsTotal: 0, rallyTimes: []
    };

    playerIds.forEach(id => {
      const p = stats[`player${id}`];
      if (!p) return;
      teamStats.aces += p.aces || 0;
      teamStats.doubleFaults += p.doubleFaults || 0;
      teamStats.winners += p.winners || 0;
      teamStats.unforcedErrors += p.unforcedErrors || 0;
      teamStats.forcedErrors += p.forcedErrors || 0;
      teamStats.firstServesIn += p.firstServesIn || 0;
      teamStats.firstServesTotal += p.firstServesTotal || 0;
      teamStats.secondServesIn += p.secondServesIn || 0;
      teamStats.secondServesTotal += p.secondServesTotal || 0;
      teamStats.pointsWon += p.pointsWon || 0;
      teamStats.breakPointsWon += p.breakPointsWon || 0;
      teamStats.breakPointsTotal += p.breakPointsTotal || 0;
      teamStats.rallyTimes = [...teamStats.rallyTimes, ...(p.rallyTimes || [])];
    });

    // Calculated fields
    teamStats.aggressiveMargin = teamStats.winners - teamStats.unforcedErrors;
    
    // Receiving points
    const oppTeamId = teamId === 1 ? 2 : 1;
    const receivingPoints = pointLog.filter(p => {
       const serverTeam = (p.serverId === 1 || p.serverId === 3) ? 1 : 2;
       return serverTeam === oppTeamId;
    });
    teamStats.receivingPointsTotal = receivingPoints.length;
    teamStats.receivingPointsWon = receivingPoints.filter(p => p.winner === teamId).length;

    // Service points won
    const servicePoints = pointLog.filter(p => {
       const serverTeam = (p.serverId === 1 || p.serverId === 3) ? 1 : 2;
       return serverTeam === teamId;
    });
    
    const firstServePoints = servicePoints.filter(p => p.reason !== 'DOUBLE_FAULT' && !p.isSecondServe); // Simple check, might need better logic if we tracked 1st/2nd serve explicitly in log
    // Actually, let's just use the stats we have
    // We need 1st service points won. Let's assume we track it in the log.
    // For now, let's estimate or add it to tennisLogic.
    
    return teamStats;
  };

  const t1 = calculateExtendedStats(1);
  const t2 = calculateExtendedStats(2);

  const StatHeader = ({ label }) => (
    <div style={{ backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #ddd' }}>
      {label}
    </div>
  );

  const StatLine = ({ label, v1, v2, isBold1, isBold2 }) => (
    <div style={{ display: 'flex', padding: '0.75rem 1rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>
      <div style={{ flex: 1, textAlign: 'left', color: '#666' }}>{label}</div>
      <div style={{ width: '60px', textAlign: 'center', fontWeight: isBold1 ? 'bold' : 'normal' }}>{v1}</div>
      <div style={{ width: '60px', textAlign: 'center', fontWeight: isBold2 ? 'bold' : 'normal' }}>{v2}</div>
    </div>
  );

  const EssentialTab = () => {
    const v1 = t1.firstServesTotal > 0 ? (t1.firstServesIn / t1.firstServesTotal) : 0;
    const v2 = t2.firstServesTotal > 0 ? (t2.firstServesIn / t2.firstServesTotal) : 0;
    const r1 = t1.receivingPointsTotal > 0 ? (t1.receivingPointsWon / t1.receivingPointsTotal) : 0;
    const r2 = t2.receivingPointsTotal > 0 ? (t2.receivingPointsWon / t2.receivingPointsTotal) : 0;

    return (
      <div style={{ backgroundColor: 'white' }}>
        <StatHeader label="Service" />
        <StatLine label="% 1st service" v1={getPercentage(t1.firstServesIn, t1.firstServesTotal)} v2={getPercentage(t2.firstServesIn, t2.firstServesTotal)} isBold1={v1 > v2} isBold2={v2 > v1} />
        <StatLine label="Aces" v1={t1.aces} v2={t2.aces} isBold1={t1.aces > t2.aces} isBold2={t2.aces > t1.aces} />
        <StatLine label="Double faults" v1={t1.doubleFaults} v2={t2.doubleFaults} isBold1={t1.doubleFaults < t2.doubleFaults} isBold2={t2.doubleFaults < t1.doubleFaults} />
        
        <StatHeader label="Points" />
        <StatLine label="Total points won" v1={t1.pointsWon} v2={t2.pointsWon} isBold1={t1.pointsWon > t2.pointsWon} isBold2={t2.pointsWon > t1.pointsWon} />
        <StatLine label="Winners" v1={t1.winners} v2={t2.winners} isBold1={t1.winners > t2.winners} isBold2={t2.winners > t1.winners} />
        <StatLine label="Unforced errors" v1={t1.unforcedErrors} v2={t2.unforcedErrors} isBold1={t1.unforcedErrors < t2.unforcedErrors} isBold2={t2.unforcedErrors < t1.unforcedErrors} />
        <StatLine label="Aggressive margin" v1={t1.aggressiveMargin} v2={t2.aggressiveMargin} isBold1={t1.aggressiveMargin > t2.aggressiveMargin} isBold2={t2.aggressiveMargin > t1.aggressiveMargin} />
        
        <StatHeader label="Conversion" />
        <StatLine label="Receiving pts won" v1={getPercentage(t1.receivingPointsWon, t1.receivingPointsTotal)} v2={getPercentage(t2.receivingPointsWon, t2.receivingPointsTotal)} isBold1={r1 > r2} isBold2={r2 > r1} />
        <StatLine label="Break points" v1={`${t1.breakPointsWon}/${t1.breakPointsTotal}`} v2={`${t2.breakPointsWon}/${t2.breakPointsTotal}`} isBold1={t1.breakPointsWon > t2.breakPointsWon} isBold2={t2.breakPointsWon > t1.breakPointsWon} />
      </div>
    );
  };

  const DetailedTab = () => {
    const getRallyDist = (times) => {
      return {
        avg: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
        longest: times.length ? Math.max(...times) : 0,
        cat1: times.filter(t => t <= 3).length,
        cat2: times.filter(t => t > 3 && t <= 10).length,
        cat3: times.filter(t => t > 10 && t <= 20).length,
        cat4: times.filter(t => t > 20).length
      };
    };

    const d1 = getRallyDist(t1.rallyTimes);
    const d2 = getRallyDist(t2.rallyTimes);

    return (
      <div style={{ backgroundColor: 'white' }}>
        <StatHeader label="Service" />
        <StatLine label="Total services" v1={t1.firstServesTotal + t1.secondServesTotal} v2={t2.firstServesTotal + t2.secondServesTotal} />
        <StatLine label="% 1st service" v1={getPercentage(t1.firstServesIn, t1.firstServesTotal)} v2={getPercentage(t2.firstServesIn, t2.firstServesTotal)} />
        <StatLine label="Aces" v1={t1.aces} v2={t2.aces} />
        <StatLine label="Double faults" v1={t1.doubleFaults} v2={t2.doubleFaults} />
        <StatLine label="1st services" v1={t1.firstServesIn} v2={t2.firstServesIn} />
        <StatLine label="2nd services" v1={t1.secondServesIn} v2={t2.secondServesIn} />
        
        <StatHeader label="Points" />
        <StatLine label="Total points won" v1={t1.pointsWon} v2={t2.pointsWon} />
        <StatLine label="Winners" v1={t1.winners} v2={t2.winners} />
        <StatLine label="Unforced errors" v1={t1.unforcedErrors} v2={t2.unforcedErrors} />
        <StatLine label="Forced errors" v1={t1.forcedErrors} v2={t2.forcedErrors} />
        <StatLine label="Aggressive margin" v1={t1.aggressiveMargin} v2={t2.aggressiveMargin} />
        
        <StatHeader label="Won rallies (by time)" />
        <StatLine label="Average" v1={formatRallyTime(d1.avg)} v2={formatRallyTime(d2.avg)} />
        <StatLine label="Longest" v1={formatRallyTime(d1.longest)} v2={formatRallyTime(d2.longest)} />
        <StatLine label='0">3"' v1={d1.cat1} v2={d2.cat1} />
        <StatLine label='0">10"' v1={d1.cat2} v2={d2.cat2} />
        <StatLine label='10">20"' v1={d1.cat3} v2={d2.cat3} />
        <StatLine label='>20"' v1={d1.cat4} v2={d2.cat4} />
      </div>
    );
  };

  const ScoreLogTab = () => {
    // Group point log by set and game
    const setsLog = [];
    pointLog.forEach(p => {
      if (!setsLog[p.set]) setsLog[p.set] = [];
      if (!setsLog[p.set][p.game]) setsLog[p.set][p.game] = { points: [], server: p.serverId };
      setsLog[p.set][p.game].points.push(p);
    });

    const getDisplayPoint = (score, isTB) => {
      if (isTB) return score;
      const map = { 0: '0', 1: '15', 2: '30', 3: '40', 4: 'Ad' };
      return map[score] || score;
    };

    return (
      <div style={{ backgroundColor: 'white', padding: '1rem' }}>
        {setsLog.map((set, setIdx) => (
          <div key={setIdx} style={{ marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Set #{setIdx + 1}</h2>
            {set.map((game, gameIdx) => {
              const serverName = config[`player${game.server}Name`];
              const scoreAtStart = game.points[0].scoreBefore;
              return (
                <div key={gameIdx} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Game #{gameIdx + 1}: {scoreAtStart.player1}-{scoreAtStart.player2}</h4>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{serverName} is serving</div>
                  {game.points.map((p, pIdx) => {
                    const winnerName = config[`player${p.winner === 1 ? 1 : 2}Name`];
                    const winnerColor = p.winner === 1 ? '#3498db' : '#f1c40f';
                    const scoreStr = `${getDisplayPoint(p.scoreBefore.player1, p.isTiebreak)}:${getDisplayPoint(p.scoreBefore.player2, p.isTiebreak)}`;
                    return (
                      <div key={pIdx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.2rem', alignItems: 'center' }}>
                         <span style={{ color: '#999', width: '40px' }}>{scoreStr}</span>
                         <span style={{ color: winnerColor }}>●</span>
                         <span style={{ backgroundColor: winnerColor + '33', padding: '0 4px', borderRadius: '2px' }}>{winnerName}</span>
                         <span style={{ color: '#666' }}>{p.reason.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    );
                  })}
                  <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{config[`player${game.points[game.points.length-1].winner === 1 ? 1 : 2}Name`]} wins the game</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const matchDuration = sets.reduce((acc, s) => {
    if (s.startTime && s.endTime) return acc + (s.endTime - s.startTime);
    if (s.startTime && !s.endTime) return acc + (Date.now() - s.startTime);
    return acc;
  }, 0);

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', margin: '-1rem' }}>
      {/* Header Summary */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: 'white' }}>
          <BarChart2 />
        </button>
        <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Statistics</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          <span>Elapsed time ∞</span>
          <span>∞'</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <span>{config.player1Name} {config.isDoubles && `& ${config.player3Name}`}</span>
          <span>{sets.reduce((acc, s) => acc + (s.player1 > s.player2 ? 1 : 0), 0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <span>{config.player2Name} {config.isDoubles && `& ${config.player4Name}`}</span>
          <span>{sets.reduce((acc, s) => acc + (s.player2 > s.player1 ? 1 : 0), 0)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'white', borderBottom: '2px solid #ddd' }}>
        {['ESSENTIAL', 'DETAILED', 'SCORE LOG'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'none',
              fontWeight: 'bold',
              color: activeTab === tab ? '#3498db' : '#888',
              borderBottom: activeTab === tab ? '3px solid #3498db' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: '2rem' }}>
        {activeTab === 'ESSENTIAL' && <EssentialTab />}
        {activeTab === 'DETAILED' && <DetailedTab />}
        {activeTab === 'SCORE LOG' && <ScoreLogTab />}
      </div>
    </div>
  );
};

export default MatchStats;

