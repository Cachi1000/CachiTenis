import React, { useState, useEffect } from 'react';
import { History, Trash2, Trophy, Plus, Calendar, Clock, Map } from 'lucide-react';

const MatchHistory = ({ onViewStats }) => {
  const [matches, setMatches] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    player1Name: '',
    player2Name: '',
    date: new Date().toISOString().split('T')[0],
    scores: '', // e.g. "6-4 6-2"
    winner: 1,
    surface: 'Clay'
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
        isDoubles: false,
        surface: manualData.surface
      },
      sets,
      winner: parseInt(manualData.winner),
      date: new Date(manualData.date).toISOString(),
      stats: {
         player1: { winners: 0, unforcedErrors: 0, pointsWon: 0 },
         player2: { winners: 0, unforcedErrors: 0, pointsWon: 0 }
      },
      pointLog: [],
      status: 'COMPLETED'
    };

    const newMatches = [...matches, matchToSave];
    localStorage.setItem('tennis_math_history', JSON.stringify(newMatches));
    setMatches(newMatches);
    setShowManualForm(false);
    setManualData({
      player1Name: '', player2Name: '', date: new Date().toISOString().split('T')[0], scores: '', winner: 1, surface: 'Clay'
    });
  };

  const formatDuration = (sets) => {
    const ms = sets.reduce((acc, s) => {
      if (s.startTime && s.endTime) return acc + (s.endTime - s.startTime);
      return acc;
    }, 0);
    if (!ms) return '0h0m';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes}m`;
  };

  const MatchCard = ({ match, index }) => {
    const { config, sets, winner, date } = match;
    const matchDate = new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: '2-digit' });
    const duration = formatDuration(sets);
    const surface = config.surface || 'Clay';

    const scoreString = sets.map(s => `${s.player1}-${s.player2}`).join(' ');

    return (
      <div className="card" style={{ backgroundColor: '#fcfcfc', border: '1px solid #eee', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginRight: '-1rem' }}>
          <button onClick={() => deleteMatch(index)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>
            <Trash2 size={16} />
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '60px', height: '60px', backgroundColor: '#e67e22', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Trophy size={32} color="white" />
             </div>
             <span style={{ color: '#3498db', fontWeight: '500' }}>{config.player1Name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>-</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '60px', height: '60px', backgroundColor: '#3498db', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Trophy size={32} color="white" />
             </div>
             <span style={{ color: '#3498db', fontWeight: '500' }}>{config.player2Name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={14} /> {matchDate}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} /> {duration}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Map size={14} /> {surface}
          </div>
        </div>

        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {scoreString}
        </div>

        <button 
          className="btn" 
          onClick={() => onViewStats(match)}
          style={{ width: '100%', backgroundColor: '#3498db', color: 'white', padding: '0.75rem', fontSize: '1rem', marginBottom: '0.5rem' }}
        >
          Detailed statistics report
        </button>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Match History</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowManualForm(!showManualForm)}>
            <Plus size={18} /> Add
          </button>
          {matches.length > 0 && (
            <button className="btn btn-ghost" onClick={clearHistory} style={{ color: 'var(--danger)' }}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {showManualForm && (
        <form onSubmit={saveManualMatch} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Log Past Match</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input value={manualData.player1Name} onChange={e => setManualData({...manualData, player1Name: e.target.value})} placeholder="Player 1" required />
            <input value={manualData.player2Name} onChange={e => setManualData({...manualData, player2Name: e.target.value})} placeholder="Player 2" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input type="date" value={manualData.date} onChange={e => setManualData({...manualData, date: e.target.value})} required />
            <select value={manualData.surface} onChange={e => setManualData({...manualData, surface: e.target.value})}>
              <option value="Clay">Clay</option>
              <option value="Hard">Hard</option>
              <option value="Grass">Grass</option>
            </select>
          </div>
          <input value={manualData.scores} onChange={e => setManualData({...manualData, scores: e.target.value})} placeholder="Scores (e.g. 6-4 6-2)" required />
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Save Match</button>
        </form>
      )}

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <History size={48} color="#ccc" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#888' }}>No matches recorded</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {matches.map((match, i) => (
            <MatchCard key={i} match={match} index={i} />
          )).reverse()}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;

