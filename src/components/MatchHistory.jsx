import React, { useState, useEffect } from 'react';
import { History, Trash2, Trophy, Plus } from 'lucide-react';

const MatchHistory = ({ onBack }) => {
  const [matches, setMatches] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    player1Name: '',
    player2Name: '',
    date: new Date().toISOString().split('T')[0],
    scores: '', // e.g. "6-4 6-2"
    winner: 1
  });

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

  const saveManualMatch = (e) => {
    e.preventDefault();
    if (!manualData.player1Name || !manualData.player2Name || !manualData.scores) return;

    // Parse scores: "6-4 6-2" -> sets: [{player1: 6, player2: 4}, {player1: 6, player2: 2}]
    const sets = manualData.scores.split(' ').map(s => {
      const parts = s.split('-');
      if (parts.length === 2) {
        return { player1: parseInt(parts[0]) || 0, player2: parseInt(parts[1]) || 0 };
      }
      return null;
    }).filter(Boolean);

    const matchToSave = {
      config: {
        player1Name: manualData.player1Name,
        player2Name: manualData.player2Name,
        isDoubles: false
      },
      sets,
      winner: parseInt(manualData.winner),
      date: new Date(manualData.date).toISOString(),
      stats: null,
      status: 'COMPLETED'
    };

    const newMatches = [...matches, matchToSave];
    localStorage.setItem('tennis_math_history', JSON.stringify(newMatches));
    setMatches(newMatches);
    setShowManualForm(false);
    setManualData({
      player1Name: '', player2Name: '', date: new Date().toISOString().split('T')[0], scores: '', winner: 1
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Match History</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowManualForm(!showManualForm)} style={{ padding: '0.5rem' }}>
            <Plus size={20} /> Add Past Match
          </button>
          <button className="btn btn-ghost" onClick={clearHistory} style={{ color: 'var(--danger)', padding: '0.5rem' }}>
            <Trash2 size={20} /> Clear All
          </button>
        </div>
      </div>

      {showManualForm && (
        <form onSubmit={saveManualMatch} className="card" style={{ backgroundColor: 'var(--bg-dark)', marginBottom: '1.5rem', border: '1px dashed var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Log Past Match</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Player 1 (or Team 1)</label>
              <input value={manualData.player1Name} onChange={e => setManualData({...manualData, player1Name: e.target.value})} placeholder="Federer" required />
            </div>
            <div>
              <label>Player 2 (or Team 2)</label>
              <input value={manualData.player2Name} onChange={e => setManualData({...manualData, player2Name: e.target.value})} placeholder="Nadal" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Date</label>
              <input type="date" value={manualData.date} onChange={e => setManualData({...manualData, date: e.target.value})} required />
            </div>
            <div>
              <label>Winner</label>
              <select value={manualData.winner} onChange={e => setManualData({...manualData, winner: e.target.value})}>
                <option value={1}>Player 1</option>
                <option value={2}>Player 2</option>
              </select>
            </div>
          </div>
          <label>Scores (format: "6-4 4-6 7-6")</label>
          <input value={manualData.scores} onChange={e => setManualData({...manualData, scores: e.target.value})} placeholder="6-4 6-2" required />
          <button type="submit" className="btn btn-primary btn-block">Save Match</button>
        </form>
      )}

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <History size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No matches recorded yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map((match, i) => {
            const { config, sets, winner, stats, date } = match;
            const matchDate = new Date(date).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={i} className="card" style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', border: '1px solid var(--border)', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{matchDate}</span>
                  <button onClick={() => deleteMatch(i)} style={{ background: 'none', border: '1px solid var(--danger)', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                    <Trash2 size={14} /> Delete
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
      )}
    </div>
  );
};

export default MatchHistory;
