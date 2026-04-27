import React, { useState, useEffect } from 'react';
import { History, Trash2, Trophy } from 'lucide-react';

const MatchHistory = ({ onBack }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('tennis_math_history');
    if (saved) {
      try {
        setMatches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse match history', e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to delete all match history?')) {
      localStorage.removeItem('tennis_math_history');
      setMatches([]);
    }
  };

  const deleteMatch = (index) => {
    if (window.confirm('Delete this match record?')) {
      const newMatches = [...matches];
      newMatches.splice(index, 1);
      localStorage.setItem('tennis_math_history', JSON.stringify(newMatches));
      setMatches(newMatches);
    }
  };

  if (matches.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <History size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: 'var(--text-muted)' }}>No matches recorded yet</h2>
        <p>Complete a match to see it here.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Match History</h2>
        <button className="btn btn-ghost" onClick={clearHistory} style={{ color: 'var(--danger)' }}>
          <Trash2 size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {matches.map((match, i) => {
          const { config, sets, winner, stats, date } = match;
          const matchDate = new Date(date).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={i} className="card" style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', border: '1px solid var(--border)', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{matchDate}</span>
                <button onClick={() => deleteMatch(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                {winner === 1 && <Trophy size={16} color="var(--primary)" style={{ marginRight: '0.5rem' }} />}
                <span style={{ fontWeight: winner === 1 ? 'bold' : 'normal', color: winner === 1 ? 'var(--primary)' : 'inherit' }}>
                  {config.player1Name}
                </span>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>vs</span>
                <span style={{ fontWeight: winner === 2 ? 'bold' : 'normal', color: winner === 2 ? 'var(--primary)' : 'inherit' }}>
                  {config.player2Name}
                </span>
                {winner === 2 && <Trophy size={16} color="var(--primary)" style={{ marginLeft: '0.5rem' }} />}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config.player1Name}</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {sets.map((set, setIndex) => (
                      <span key={setIndex} style={{ fontWeight: set.player1 > set.player2 ? 'bold' : 'normal' }}>{set.player1}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config.player2Name}</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {sets.map((set, setIndex) => (
                      <span key={setIndex} style={{ fontWeight: set.player2 > set.player1 ? 'bold' : 'normal' }}>{set.player2}</span>
                    ))}
                  </div>
                </div>
              </div>

              {stats && (
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <div>W: {stats.player1.winners} / UE: {stats.player1.unforcedErrors}</div>
                  <div style={{ textAlign: 'right' }}>W: {stats.player2.winners} / UE: {stats.player2.unforcedErrors}</div>
                </div>
              )}
            </div>
          );
        }).reverse()}
      </div>
    </div>
  );
};

export default MatchHistory;
