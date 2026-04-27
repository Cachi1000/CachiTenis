import React, { useState } from 'react';
import { Settings, Play, Trophy, RotateCcw, Activity } from 'lucide-react';
import { createMatchState, addPoint, registerFault, undoLastAction } from './tennisLogic';
import SetupMatch from './components/SetupMatch';
import MatchView from './components/MatchView';
import MatchStats from './components/MatchStats';
import MatchHistory from './components/MatchHistory';
import LiveMatchViewer from './components/LiveMatchViewer';
import TournamentModule from './components/TournamentModule';
import { History as HistoryIcon, Radio, BarChart2 } from 'lucide-react';
import { io } from 'socket.io-client';

const APP_VERSION = 'v1.2.0';

function App() {
  const [currentView, setCurrentView] = useState('SETUP'); // SETUP, MATCH, STATS, HISTORY, LIVE_WATCH
  const [matchState, setMatchState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [liveCode, setLiveCode] = useState(null);
  const [tournamentState, setTournamentState] = useState(null);

  const forceUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister()
        }
      });
    }
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)))
    }).then(() => {
      window.location.reload(true);
    });
  };

  const startMatch = (config) => {
    const newState = createMatchState(config);
    setMatchState(newState);
    setCurrentView('MATCH');

    if (config.isLive) {
      const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `http://${window.location.hostname}:3001` : '/';
      const s = io(socketUrl);
      
      s.on('connect', () => {
        s.emit('host_match', { state: newState });
      });
      
      s.on('match_hosted', (data) => {
        setLiveCode(data.roomId);
      });
      
      setSocket(s);
    } else {
      setSocket(null);
      setLiveCode(null);
    }
  };

  const joinLiveMatch = (code) => {
    setLiveCode(code);
    setCurrentView('LIVE_WATCH');
  };

  const leaveMatch = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setLiveCode(null);
    setMatchState(null);
    setCurrentView('SETUP');
  };

  const enterTournament = () => {
    setCurrentView('TOURNAMENT');
  };

  const handleAction = (actionType, playerId) => {
    if (!matchState || matchState.status === 'COMPLETED') return;

    if (actionType === 'UNDO') {
      const newState = undoLastAction(matchState);
      setMatchState(newState);
      if (socket && liveCode) socket.emit('update_match', { roomId: liveCode, state: newState });
      return;
    }

    if (actionType === 'FAULT') {
      const newState = registerFault(matchState);
      setMatchState(newState);
      if (socket && liveCode) socket.emit('update_match', { roomId: liveCode, state: newState });
      return;
    }

    // Action types: ACE, WINNER, UNFORCED_ERROR, FORCED_ERROR, DOUBLE_FAULT, START_POINT
    if (actionType === 'START_POINT') {
      const newState = addPoint(matchState, 'START_POINT', 'START_POINT');
      setMatchState(newState);
      if (socket && liveCode) socket.emit('update_match', { roomId: liveCode, state: newState });
      return;
    }

    const newState = addPoint(matchState, playerId, actionType);
    setMatchState(newState);
    if (socket && liveCode) socket.emit('update_match', { roomId: liveCode, state: newState });

    if (newState.status === 'COMPLETED' && matchState.status !== 'COMPLETED') {
      // Update Tournament State if applicable
      if (newState.tournamentMatchId !== undefined && tournamentState) {
        const updatedTournament = { ...tournamentState };
        if (newState.groupIndex !== undefined) {
          // Round Robin update
          const group = updatedTournament.groups[newState.groupIndex];
          const match = group.matches.find(m => m.id === newState.tournamentMatchId);
          if (match) {
            match.score = `${newState.sets.map(s => `${s.player1}-${s.player2}`).join(' ')}`;
            match.status = 'FINISHED';
            match.winner = newState.winner;
            
            // Update group standings (PG, PP, Pts)
            group.players = group.players.map(p => {
              const matchesWon = group.matches.filter(m => m.status === 'FINISHED' && ((m.p1 === p.name && m.winner === 1) || (m.p2 === p.name && m.winner === 2))).length;
              const matchesLost = group.matches.filter(m => m.status === 'FINISHED' && ((m.p1 === p.name && m.winner === 2) || (m.p2 === p.name && m.winner === 1))).length;
              return {
                ...p,
                pg: matchesWon,
                pp: matchesLost,
                pj: matchesWon + matchesLost,
                pts: matchesWon * 2 + matchesLost // Traditional tennis RR points
              };
            });
          }
        }
        setTournamentState(updatedTournament);
      }

      // Save to history immediately when completed
      const savedStr = localStorage.getItem('tennis_math_history');
      let saved = [];
      if (savedStr) {
        try { saved = JSON.parse(savedStr); } catch(e) {}
      }
      
      const matchToSave = {
        ...newState,
        date: new Date().toISOString()
      };
      // Clean up history to save space
      delete matchToSave.history;
      
      saved.push(matchToSave);
      localStorage.setItem('tennis_math_history', JSON.stringify(saved));
    }
  };

  const finishMatch = () => {
    setCurrentView('STATS');
  };

  const viewHistoricalStats = (match) => {
    setMatchState(match);
    setCurrentView('STATS');
  };

  return (
    <>
      <header className="app-header">
        <div className="app-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} color="var(--primary)" />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span>Fusakatan Open</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }} onClick={forceUpdate}>
              Versión {APP_VERSION} 
              <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>(Forzar actualización)</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {currentView === 'SETUP' && (
            <>
              <button className="btn btn-ghost btn-icon" onClick={enterTournament} title="Tournament">
                <Trophy size={20} />
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('HISTORY')} title="Match History">
                <HistoryIcon size={20} />
              </button>
            </>
          )}
          {currentView === 'MATCH' && (
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('STATS')} title="View Stats">
              <BarChart2 size={20} />
            </button>
          )}
          {currentView === 'STATS' && matchState && matchState.status !== 'COMPLETED' && (
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('MATCH')} title="Back to Match">
              <Play size={20} />
            </button>
          )}
          {(currentView === 'MATCH' || currentView === 'STATS' || currentView === 'HISTORY' || currentView === 'TOURNAMENT') && (
            <button className="btn btn-ghost btn-icon" onClick={leaveMatch} title="Home">
              <Settings size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="container animate-slide-in">
        {currentView === 'SETUP' && <SetupMatch onStart={startMatch} onJoinLive={joinLiveMatch} />}
        {currentView === 'MATCH' && matchState && (
          <MatchView 
            state={matchState} 
            onAction={handleAction} 
            onFinish={finishMatch} 
            liveCode={liveCode}
          />
        )}
        {currentView === 'STATS' && matchState && (
          <MatchStats state={matchState} />
        )}
        {currentView === 'HISTORY' && (
          <MatchHistory onViewStats={viewHistoricalStats} />
        )}
        {currentView === 'LIVE_WATCH' && (
          <LiveMatchViewer liveCode={liveCode} onBack={leaveMatch} />
        )}
        {currentView === 'TOURNAMENT' && (
          <TournamentModule 
            tournamentState={tournamentState}
            setTournamentState={setTournamentState}
            onBroadcast={(config) => {
             // Create initial state for the tournament match
             const newState = createMatchState(config.config);
             // Add tournament metadata
             newState.tournamentMatchId = config.matchId;
             newState.groupIndex = config.groupIndex;
             
             setMatchState(newState);
             setCurrentView('MATCH');
             
             // If it's a live match, set up the socket
             if (config.config.isLive) {
               const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                 ? `http://${window.location.hostname}:3001` : '/';
               const s = io(socketUrl);
               
               s.on('connect', () => {
                 s.emit('host_match', { state: newState });
               });
               
               s.on('match_hosted', (data) => {
                 setLiveCode(data.roomId);
               });
               
               setSocket(s);
             }
          }} />
        )}
      </main>
    </>
  );
}

export default App;
