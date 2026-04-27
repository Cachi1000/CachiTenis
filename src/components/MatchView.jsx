import React, { useState, useEffect } from 'react';
import { RotateCcw, Crosshair, XCircle, AlertTriangle, PlayCircle, Trophy, Radio, Activity } from 'lucide-react';
import { getDisplayScore } from '../tennisLogic';

const MatchView = ({ state, onAction, onFinish, readOnly = false, liveCode = null }) => {
  const { config, currentSet, sets, currentGame, server, firstServeFault, status } = state;
  const [activeTab, setActiveTab] = useState('SERVICE');

  // Reset to SERVICE tab when server changes or score changes (point ends)
  useEffect(() => {
    setActiveTab('SERVICE');
  }, [state.currentGame.player1, state.currentGame.player2, state.server, state.sets]);

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

  const handlePointEnd = (action, playerId) => {
    onAction(action, playerId);
  };

  const ServiceTab = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <button 
          className="action-btn serve" 
          style={{ padding: '1.5rem', fontSize: '1.2rem', minHeight: '80px', backgroundColor: '#2ca0d9', color: 'white' }} 
          onClick={() => handlePointEnd('ACE', server)}
        >
          Ace
        </button>
        <button 
          className="action-btn error" 
          style={{ padding: '1.5rem', fontSize: '1.2rem', minHeight: '80px', backgroundColor: '#2ca0d9', color: 'white' }} 
          onClick={() => handlePointEnd('FAULT', server)}
        >
          {firstServeFault ? 'Double Fault' : 'Fault'}
        </button>
        <button 
          className="action-btn" 
          style={{ padding: '1.5rem', fontSize: '1.2rem', minHeight: '120px', backgroundColor: '#2ca0d9', color: 'white' }} 
          onClick={() => setActiveTab('POINT')}
        >
          Ball In Play
        </button>
      </div>
    );
  };

  const PointTab = () => {
    let displayName1 = config.player1Name;
    if (config.isDoubles) displayName1 += ` & ${config.player3Name}`;
    let displayName2 = config.player2Name;
    if (config.isDoubles) displayName2 += ` & ${config.player4Name}`;

    const renderButton = (label, action, playerId) => (
      <button 
        className="action-btn winner" 
        style={{ padding: '1rem 0.5rem', fontSize: '1rem', backgroundColor: '#2ca0d9', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }} 
        onClick={() => handlePointEnd(action, playerId)}
      >
        <span>{label}</span>
        {config.isDoubles && <span style={{fontSize: '0.8rem', marginTop: '0.2rem', opacity: 0.8}}>{config[`player${playerId}Name`]}</span>}
      </button>
    );

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{displayName1}</h4>
          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{displayName2}</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {renderButton('Winner', 'WINNER', 1)}
            {config.isDoubles && renderButton('Winner', 'WINNER', 3)}
            
            {renderButton('Forced Error', 'FORCED_ERROR', 1)}
            {config.isDoubles && renderButton('Forced Error', 'FORCED_ERROR', 3)}
            
            {renderButton('Unforced Error', 'UNFORCED_ERROR', 1)}
            {config.isDoubles && renderButton('Unforced Error', 'UNFORCED_ERROR', 3)}
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {renderButton('Winner', 'WINNER', 2)}
            {config.isDoubles && renderButton('Winner', 'WINNER', 4)}
            
            {renderButton('Forced Error', 'FORCED_ERROR', 2)}
            {config.isDoubles && renderButton('Forced Error', 'FORCED_ERROR', 4)}
            
            {renderButton('Unforced Error', 'UNFORCED_ERROR', 2)}
            {config.isDoubles && renderButton('Unforced Error', 'UNFORCED_ERROR', 4)}
          </div>
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
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '0.5rem' }}>
            <button 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderBottom: activeTab === 'SERVICE' ? '3px solid #2ca0d9' : '3px solid transparent',
                fontWeight: activeTab === 'SERVICE' ? 'bold' : 'normal',
                color: activeTab === 'SERVICE' ? 'var(--text-color)' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('SERVICE')}
            >
              1. SERVICE
            </button>
            <button 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                backgroundColor: 'transparent', 
                border: 'none', 
                borderBottom: activeTab === 'POINT' ? '3px solid #2ca0d9' : '3px solid transparent',
                fontWeight: activeTab === 'POINT' ? 'bold' : 'normal',
                color: activeTab === 'POINT' ? 'var(--text-color)' : 'var(--text-muted)'
              }}
              onClick={() => setActiveTab('POINT')}
            >
              POINT
            </button>
            <div style={{ padding: '0.75rem', color: 'var(--warning)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
               <button onClick={() => onAction('UNDO', null)} style={{background: 'none', border: 'none', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem'}}>
                 [Undo]
               </button>
            </div>
          </div>
          {activeTab === 'SERVICE' ? <ServiceTab /> : <PointTab />}
        </div>
      )}


    </div>
  );
};

export default MatchView;
