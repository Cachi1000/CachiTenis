import React, { useState } from 'react';
import { Calendar, Users, FileText, Activity, MapPin, Clock, ChevronRight, Trophy, Settings } from 'lucide-react';

const TournamentModule = ({ onBroadcast, tournamentState, setTournamentState }) => {
  const [activeTab, setActiveTab] = useState('BRACKET');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [format, setFormat] = useState('SINGLES');
  const [groupSize, setGroupSize] = useState(4);
  const [selectedForSwap, setSelectedForSwap] = useState(null); // { matchId, playerIndex }

  const regulation = `
# Reglamento Fusakatan Open 2026

1. **Formato de Juego**: Todos los partidos se jugarán al mejor de 3 sets con Super Tiebreak en el tercer set (10 puntos).
2. **Puntualidad**: Los jugadores deben presentarse 15 minutos antes de la hora programada. W.O. a los 15 minutos de retraso.
3. **Superficie**: Tierra batida (Clay).
4. **Bolas**: Se utilizarán bolas nuevas para cada partido de cuadro principal.
    `;

  const schedule = [
    { time: '09:00', court: 'Central', match: 'J. Cedeño vs C. Cedeño', status: 'Finalizado' },
    { time: '11:00', court: 'Central', match: 'A. Ramirez vs M. Lopez', status: 'En Juego' },
  ];

  // Helper to generate a draw based on format
  const generateDraw = () => {
    if (players.length < 2) return;
    
    // Sort players by seed, then random for the rest
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.seed && b.seed) return a.seed - b.seed;
      if (a.seed) return -1;
      if (b.seed) return 1;
      return Math.random() - 0.5;
    });

    if (format === 'RR') {
      // Group players based on selected groupSize
      const numGroups = Math.ceil(sortedPlayers.length / groupSize);
      const groups = [];
      
      for (let i = 0; i < numGroups; i++) {
        const groupPlayers = sortedPlayers.slice(i * groupSize, (i + 1) * groupSize);
        const groupMatches = [];
        
        // Generate all-play-all matches
        for (let j = 0; j < groupPlayers.length; j++) {
          for (let k = j + 1; k < groupPlayers.length; k++) {
            groupMatches.push({
              id: `${i}-${j}-${k}`,
              p1: groupPlayers[j].name,
              p2: groupPlayers[k].name,
              score: '',
              status: 'SCHEDULED'
            });
          }
        }

        groups.push({
          name: `Grupo ${String.fromCharCode(65 + i)}`,
          players: groupPlayers,
          matches: groupMatches
        });
      }
      
      setTournamentState({
        name: 'Fusakatan Open 2026',
        format: 'RR',
        groups
      });
    } else {
      // Single Elimination (Singles/Doubles/Team)
      const size = Math.pow(2, Math.ceil(Math.log2(sortedPlayers.length)));
      const draw = Array(size).fill(null).map((_, i) => sortedPlayers[i] || { name: 'BYE', isBye: true });

      const bracket = [];
      for (let i = 0; i < size / 2; i++) {
        bracket.push({
          id: i + 1,
          p1: draw[i].name,
          p2: draw[size - 1 - i].name,
          score: '',
          status: 'SCHEDULED',
          time: 'TBD'
        });
      }

      setTournamentState({
        name: 'Fusakatan Open 2026',
        format: 'ELIMINATION',
        rounds: [{ round: 'Primera Ronda', matches: bracket }]
      });
    }
    setActiveTab('BRACKET');
  };

  const addPlayer = () => {
    if (!newPlayer) return;
    setPlayers([...players, { name: newPlayer, seed: null }]);
    setNewPlayer('');
  };

  const toggleSeed = (index) => {
    const p = [...players];
    const currentSeeds = p.filter(x => x.seed !== null).length;
    p[index].seed = p[index].seed ? null : currentSeeds + 1;
    setPlayers(p);
  };

  const ManageView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h3>Configuración del Torneo</h3>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Formato del Torneo</label>
        <select value={format} onChange={e => setFormat(e.target.value)} style={{ marginBottom: '1rem' }}>
          <option value="SINGLES">Singles (Eliminación Directa)</option>
          <option value="DOUBLES">Dobles (Eliminación Directa)</option>
          <option value="TEAM">Equipos (Tipo Copa Davis)</option>
          <option value="RR">Round Robin (Grupos)</option>
        </select>

        {format === 'RR' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jugadores por Grupo</label>
            <select value={groupSize} onChange={e => setGroupSize(parseInt(e.target.value))}>
              <option value={3}>3 Jugadores</option>
              <option value={4}>4 Jugadores</option>
              <option value={5}>5 Jugadores</option>
            </select>
          </div>
        )}

        <h3>Gestión de Jugadores / Parejas</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            value={newPlayer} 
            onChange={e => setNewPlayer(e.target.value)} 
            placeholder="Nombre del jugador" 
            onKeyPress={e => e.key === 'Enter' && addPlayer()}
          />
          <button className="btn btn-primary" onClick={addPlayer}>Añadir</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
              <span>{p.name} {p.seed && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>[S{p.seed}]</span>}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => toggleSeed(i)}>
                  {p.seed ? 'Quitar Siembra' : 'Hacer Siembra'}
                </button>
                <button className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }} onClick={() => setPlayers(players.filter((_, idx) => idx !== i))}>
                   Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }} onClick={generateDraw}>
          Generar Cuadro (Sorteo)
        </button>
      </div>
    </div>
  );

  const handleSwap = (matchId, playerIndex) => {
    if (!selectedForSwap) {
      setSelectedForSwap({ matchId, playerIndex });
      return;
    }

    if (selectedForSwap.matchId === matchId && selectedForSwap.playerIndex === playerIndex) {
      setSelectedForSwap(null);
      return;
    }

    // Perform swap
    const newState = { ...tournamentState };
    const m1 = newState.rounds[0].matches.find(m => m.id === selectedForSwap.matchId);
    const m2 = newState.rounds[0].matches.find(m => m.id === matchId);
    
    const p1Key = selectedForSwap.playerIndex === 1 ? 'p1' : 'p2';
    const p2Key = playerIndex === 1 ? 'p1' : 'p2';
    
    const temp = m1[p1Key];
    m1[p1Key] = m2[p2Key];
    m2[p2Key] = temp;
    
    setTournamentState(newState);
    setSelectedForSwap(null);
  };

  const BracketView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!tournamentState ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Trophy size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
          <p>No hay un cuadro generado. Ve a "Gestionar" para crear uno.</p>
        </div>
      ) : tournamentState.format === 'RR' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {tournamentState.groups.map((group, gi) => (
            <div key={gi} className="card" style={{ padding: '1rem' }}>
              <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{group.name}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Jugador</th>
                    <th style={{ padding: '0.5rem' }}>PJ</th>
                    <th style={{ padding: '0.5rem' }}>PG</th>
                    <th style={{ padding: '0.5rem' }}>PP</th>
                    <th style={{ padding: '0.5rem' }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.players.map((p, pi) => (
                    <tr key={pi} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{p.name}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>{p.pj || 0}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>{p.pg || 0}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>{p.pp || 0}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem' }}>{p.pts || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-ghost btn-block" style={{ marginTop: '1rem', fontSize: '0.8rem', border: '1px dashed var(--border)' }} onClick={() => {
                const groupElement = document.getElementById(`matches-group-${gi}`);
                groupElement.style.display = groupElement.style.display === 'none' ? 'block' : 'none';
              }}>
                Ver Partidos del Grupo
              </button>
              
              <div id={`matches-group-${gi}`} style={{ display: 'none', marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                {group.matches.map((m, mi) => (
                  <div key={mi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: mi === group.matches.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.85rem' }}>{m.p1} vs {m.p2}</span>
                    <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => onBroadcast({ 
                      config: { player1Name: m.p1, player2Name: m.p2, isLive: true }, 
                      matchId: m.id,
                      groupIndex: gi,
                      status: 'IN_PROGRESS' 
                    })}>
                      Transmitir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        tournamentState.rounds.map((round, ri) => (
          <div key={ri}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{round.round}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedForSwap && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', alignSelf: 'center' }}>Selecciona otro jugador para intercambiar...</span>}
                <button className="btn btn-ghost" onClick={() => window.print()} style={{ fontSize: '0.8rem' }}>Exportar PDF</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {round.matches.map((m, mi) => (
                <div key={mi} className="card" style={{ padding: '0.75rem', border: '1px solid var(--border)', backgroundColor: m.status === 'LIVE' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Match #{m.id}</span>
                    {m.status === 'LIVE' && <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>EN VIVO</span>}
                  </div>
                  
                  <div 
                    onClick={() => handleSwap(m.id, 1)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      backgroundColor: selectedForSwap?.matchId === m.id && selectedForSwap?.playerIndex === 1 ? 'rgba(44, 160, 217, 0.2)' : 'transparent',
                      border: selectedForSwap?.matchId === m.id && selectedForSwap?.playerIndex === 1 ? '1px dashed var(--primary)' : '1px solid transparent'
                    }}
                  >
                    <span>{m.p1}</span>
                    <span>{m.score.split(' ')[0]}</span>
                  </div>
                  
                  <div 
                    onClick={() => handleSwap(m.id, 2)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      padding: '0.25rem',
                      marginTop: '0.25rem',
                      borderRadius: '4px',
                      backgroundColor: selectedForSwap?.matchId === m.id && selectedForSwap?.playerIndex === 2 ? 'rgba(44, 160, 217, 0.2)' : 'transparent',
                      border: selectedForSwap?.matchId === m.id && selectedForSwap?.playerIndex === 2 ? '1px dashed var(--primary)' : '1px solid transparent'
                    }}
                  >
                    <span>{m.p2}</span>
                    <span>{m.score.split(' ')[1] || ''}</span>
                  </div>
                  
                  {m.p1 !== 'BYE' && m.p2 !== 'BYE' && (
                    <button className="btn btn-primary btn-block" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem' }} onClick={() => onBroadcast({ config: { player1Name: m.p1, player2Name: m.p2, isLive: true }, status: 'IN_PROGRESS' })}>Transmitir</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const ScheduleView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {schedule.map((s, i) => (
        <div key={i} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'center', minWidth: '60px', borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
            <Clock size={16} style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontWeight: 'bold' }}>{s.time}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.match}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> {s.court} • {s.status}
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </div>
      ))}
    </div>
  );

  const RegulationView = () => (
    <div className="card" style={{ padding: '1.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      <FileText size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      {regulation}
    </div>
  );

  return (
    <div className="animate-slide-in">
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: '1rem', 
        padding: '1.5rem', 
        textAlign: 'center', 
        marginBottom: '1.5rem',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #1e293b 0%, #064e3b 100%)',
        color: 'white'
      }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%', margin: '0 auto 1rem', padding: '10px' }}>
           <img src="https://i.ibb.co/LzNfS6D/fusakatan-logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Fusakatan Open</h1>
        <p style={{ opacity: 0.8, margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Fusagasugá • 2026</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'BRACKET', label: 'Cuadro', icon: Trophy },
          { id: 'SCHEDULE', label: 'Horarios', icon: Clock },
          { id: 'MANAGE', label: 'Gestionar', icon: Settings },
          { id: 'REGULATION', label: 'Reglamento', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <main>
        {activeTab === 'BRACKET' && <BracketView />}
        {activeTab === 'MANAGE' && <ManageView />}
        {activeTab === 'SCHEDULE' && <ScheduleView />}
        {activeTab === 'REGULATION' && <RegulationView />}
      </main>
    </div>
  );
};

export default TournamentModule;
