import React from 'react';
import { RotateCcw, Crosshair, XCircle, AlertTriangle, PlayCircle, Trophy, Radio } from 'lucide-react';
import { getDisplayScore } from '../tennisLogic';

const MatchView = ({ state, onAction, onFinish, readOnly = false, liveCode = null }) => {
  const { config, currentSet, sets, currentGame, server, firstServeFault, status } = state;

  const renderSets = () => {
    return sets.map((set, i) => (
      <div key={i} className="score-boxes" style={{ marginRight: '0.5rem' }}>
        <div className="score-box" style={{ fontWeight: i === currentSet ? 'bold' : 'normal', color: i === currentSet ? 'white' : 'var(--text-muted)' }}>{set.player1}</div>
        <div className="score-box" style={{ fontWeight: i === currentSet ? 'bold' : 'normal', color: i === currentSet ? 'white' : 'var(--text-muted)' }}>{set.player2}</div>
      </div>
    ));
  };

  const renderCurrentGame = (playerId) => {
    const score = getDisplayScore(currentGame[`player${playerId}`], currentGame.isTiebreak || currentGame.isSuperTiebreak);
    return <div className="score-box points">{score}</div>;
  };

  if (status === 'COMPLETED') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Trophy size={64} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
        <h2>Match Completed!</h2>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
          {state.winner === 1 ? config.player1Name : config.player2Name} wins
        </h3>
        <button className="btn btn-primary" onClick={onFinish}>
          View Match Statistics
        </button>
      </div>
    );
  }

  const PlayerActions = ({ playerId }) => {
    if (readOnly) return null;
    const isServing = server === playerId;
    
    let displayName = playerId === 1 ? config.player1Name : config.player2Name;
    if (config.isDoubles) {
      displayName += ` & ${playerId === 1 ? config.player3Name : config.player4Name}`;
    }
    
    return (
      <div className="card" style={{ padding: '1rem', borderTop: isServing ? '4px solid var(--accent)' : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{displayName}</h3>
          {isServing && <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--accent)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>SERVING</span>}
        </div>
        
        {isServing && (
          <div className="action-grid" style={{ marginBottom: '1rem' }}>
            <button className="action-btn serve" onClick={() => onAction('ACE', playerId)}>
              <PlayCircle className="icon" />
              <span>Ace</span>
            </button>
            <button className="action-btn error" onClick={() => onAction('FAULT', playerId)}>
              <AlertTriangle className="icon" style={{ color: 'var(--danger)' }} />
              <span>{firstServeFault ? 'Double Fault' : 'Fault'}</span>
            </button>
          </div>
        )}
        
        <div className="action-grid">
          <button className="action-btn winner" onClick={() => onAction('WINNER', playerId)} style={{ gridColumn: 'span 2' }}>
            <Crosshair className="icon" />
            <span>Winner</span>
          </button>
          <button className="action-btn error" onClick={() => onAction('UNFORCED_ERROR', playerId)}>
            <XCircle className="icon" style={{ color: 'var(--danger)' }} />
            <span>Unforced Error</span>
          </button>
          <button className="action-btn error" onClick={() => onAction('FORCED_ERROR', playerId)}>
            <AlertTriangle className="icon" style={{ color: 'var(--warning)' }} />
            <span>Forced Error</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {liveCode && !readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          <Radio size={18} className="animate-pulse" /> LIVE - Match Code: {liveCode}
        </div>
      )}
      {readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontWeight: 'bold', justifyContent: 'center' }}>
          <Radio size={18} /> WATCHING LIVE MATCH
        </div>
      )}
      <div className="scoreboard">
        <div className={`scoreboard-row ${server === 1 ? 'active' : ''}`}>
          <div className="player-info">
            <div className={`serve-indicator ${server === 1 ? '' : 'hidden'}`}></div>
            <div className="player-name">
              {config.player1Name}
              {config.isDoubles && <><br/><span style={{fontSize: '0.875rem'}}>{config.player3Name}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
              {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem', opacity: i === currentSet ? 1 : 0.6 }}>{set.player1}</div>)}
              <div style={{ width: '1rem' }}></div>
              {renderCurrentGame(1)}
            </div>
          </div>
        </div>
        <div className={`scoreboard-row ${server === 2 ? 'active' : ''}`}>
          <div className="player-info">
            <div className={`serve-indicator ${server === 2 ? '' : 'hidden'}`}></div>
            <div className="player-name">
              {config.player2Name}
              {config.isDoubles && <><br/><span style={{fontSize: '0.875rem'}}>{config.player4Name}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              {sets.map((set, i) => <div key={i} className="score-box" style={{ marginRight: '0.25rem', opacity: i === currentSet ? 1 : 0.6 }}>{set.player2}</div>)}
              <div style={{ width: '1rem' }}></div>
              {renderCurrentGame(2)}
            </div>
          </div>
        </div>
        {(currentGame.isTiebreak || currentGame.isSuperTiebreak) && (
          <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
            {currentGame.isSuperTiebreak ? 'SUPER TIEBREAK' : 'TIEBREAK'}
          </div>
        )}
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '5rem' }}>
          <PlayerActions playerId={1} />
          <PlayerActions playerId={2} />
        </div>
      )}

      {state.history.length > 0 && !readOnly && (
        <button className="fab" onClick={() => onAction('UNDO', null)} title="Undo Last Point">
          <RotateCcw size={24} />
        </button>
      )}
    </div>
  );
};

export default MatchView;
