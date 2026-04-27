import React, { useState } from 'react';
import { Settings, Play, Trophy, RotateCcw, Activity } from 'lucide-react';
import { createMatchState, addPoint, registerFault, undoLastAction } from './tennisLogic';
import SetupMatch from './components/SetupMatch';
import MatchView from './components/MatchView';
import MatchStats from './components/MatchStats';
import MatchHistory from './components/MatchHistory';
import LiveMatchViewer from './components/LiveMatchViewer';
import { History as HistoryIcon, Radio } from 'lucide-react';
import { io } from 'socket.io-client';

function App() {
  const [currentView, setCurrentView] = useState('SETUP'); // SETUP, MATCH, STATS, HISTORY, LIVE_WATCH
  const [matchState, setMatchState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [liveCode, setLiveCode] = useState(null);

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

    // Action types: ACE, WINNER, UNFORCED_ERROR, FORCED_ERROR, DOUBLE_FAULT
    const newState = addPoint(matchState, playerId, actionType);
    setMatchState(newState);
    if (socket && liveCode) socket.emit('update_match', { roomId: liveCode, state: newState });

    if (newState.status === 'COMPLETED' && matchState.status !== 'COMPLETED') {
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

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          <Activity size={24} color="var(--primary)" />
          Cachi Tenis Pro
        </div>
        <div>
          {currentView === 'SETUP' && (
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('HISTORY')} title="Match History">
              <HistoryIcon size={20} />
            </button>
          )}
          {currentView === 'MATCH' && (
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('STATS')} title="View Stats">
              <Trophy size={20} />
            </button>
          )}
          {currentView === 'STATS' && matchState && matchState.status !== 'COMPLETED' && (
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentView('MATCH')} title="Back to Match">
              <Play size={20} />
            </button>
          )}
          {(currentView === 'MATCH' || currentView === 'STATS' || currentView === 'HISTORY') && (
            <button className="btn btn-ghost btn-icon" onClick={leaveMatch} title="New Match">
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
          <MatchHistory />
        )}
        {currentView === 'LIVE_WATCH' && (
          <LiveMatchViewer liveCode={liveCode} onBack={leaveMatch} />
        )}
      </main>
    </>
  );
}

export default App;
