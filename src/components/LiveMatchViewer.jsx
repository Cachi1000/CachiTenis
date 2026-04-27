import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MatchView from './MatchView';
import { AlertCircle, Loader } from 'lucide-react';

const LiveMatchViewer = ({ liveCode, onBack }) => {
  const [matchState, setMatchState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Determine the socket.io URL. If in dev, usually localhost:3001.
    // In a real app this should point to the hosted backend.
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `http://${window.location.hostname}:3001`
      : '/';
    
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_match', { roomId: liveCode });
    });

    socket.on('match_joined', (data) => {
      setMatchState(data.state);
      setError(null);
    });

    socket.on('match_updated', (data) => {
      setMatchState(data.state);
    });

    socket.on('error', (err) => {
      setError(err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [liveCode]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: 'var(--danger)' }}>Connection Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  if (!matchState) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Loader size={48} color="var(--primary)" className="animate-pulse" style={{ margin: '0 auto 1rem' }} />
        <h2>Connecting...</h2>
        <p>Looking for live match <strong>{liveCode}</strong></p>
        <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: '1rem' }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <MatchView state={matchState} readOnly={true} liveCode={liveCode} />
      <button className="btn btn-secondary btn-block" onClick={onBack} style={{ marginTop: '1rem' }}>
        Leave Match
      </button>
    </div>
  );
};

export default LiveMatchViewer;
