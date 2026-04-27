import React, { useState } from 'react';
import { MATCH_FORMATS, SET_FORMATS, GAME_FORMATS } from '../tennisLogic';
import { Users, User, Radio, Play } from 'lucide-react';

const SetupMatch = ({ onStart, onJoinLive }) => {
  const [isDoubles, setIsDoubles] = useState(false);
  const [liveCode, setLiveCode] = useState('');
  const [config, setConfig] = useState({
    player1Name: 'Roger',
    player2Name: 'Rafa',
    player3Name: '',
    player4Name: '',
    format: MATCH_FORMATS.BEST_OF_3,
    setFormat: SET_FORMATS.TIEBREAK_AT_6_6,
    gameFormat: GAME_FORMATS.ADVANTAGE,
    player1StartsServing: true,
  });
  const [customRules, setCustomRules] = useState({
    setsToWin: 2,
    gamesToWinSet: 6,
    tiebreakAt: 6,
    tiebreakPoints: 7,
    finalSetSuperTiebreak: false,
    superTiebreakPoints: 10,
    winSetByTwo: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config.player1Name || !config.player2Name) return;
    const finalConfig = { ...config, isDoubles, isLive: false };
    if (config.format === MATCH_FORMATS.CUSTOM) finalConfig.customRules = customRules;
    onStart(finalConfig);
  };

  const handleLiveHost = () => {
    if (!config.player1Name || !config.player2Name) return;
    const finalConfig = { ...config, isDoubles, isLive: true };
    if (config.format === MATCH_FORMATS.CUSTOM) finalConfig.customRules = customRules;
    onStart(finalConfig);
  };

  return (
    <div className="card">
      <h2>New Match Setup</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          type="button"
          className={`btn ${!isDoubles ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ flex: 1 }}
          onClick={() => setIsDoubles(false)}
        >
          <User size={20} /> Singles
        </button>
        <button 
          type="button"
          className={`btn ${isDoubles ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ flex: 1 }}
          onClick={() => setIsDoubles(true)}
        >
          <Users size={20} /> Doubles
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>{isDoubles ? "Team 1 (Top)" : "Player 1 (Top)"}</label>
          <input 
            type="text" 
            value={config.player1Name}
            onChange={e => setConfig({...config, player1Name: e.target.value})}
            placeholder={isDoubles ? "Player 1 Name" : "Player 1 Name"}
            required
          />
          {isDoubles && (
            <input 
              type="text" 
              value={config.player3Name}
              onChange={e => setConfig({...config, player3Name: e.target.value})}
              placeholder="Player 2 Name"
              required
            />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={config.player1StartsServing === true}
              onChange={() => setConfig({...config, player1StartsServing: true})}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            Starts serving
          </label>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>{isDoubles ? "Team 2 (Bottom)" : "Player 2 (Bottom)"}</label>
          <input 
            type="text" 
            value={config.player2Name}
            onChange={e => setConfig({...config, player2Name: e.target.value})}
            placeholder={isDoubles ? "Player 3 Name" : "Player 2 Name"}
            required
          />
          {isDoubles && (
            <input 
              type="text" 
              value={config.player4Name}
              onChange={e => setConfig({...config, player4Name: e.target.value})}
              placeholder="Player 4 Name"
              required
            />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={config.player1StartsServing === false}
              onChange={() => setConfig({...config, player1StartsServing: false})}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            Starts serving
          </label>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Match Format</label>
          <select 
            value={config.format}
            onChange={e => setConfig({...config, format: e.target.value})}
          >
            <option value={MATCH_FORMATS.BEST_OF_3}>Best of 3 Sets</option>
            <option value={MATCH_FORMATS.BEST_OF_5}>Best of 5 Sets</option>
            <option value={MATCH_FORMATS.ONE_SET}>One Set Match</option>
            <option value={MATCH_FORMATS.TIEBREAKS_ONLY_BEST_OF_3}>Tiebreaks Only (Best of 3)</option>
            <option value={MATCH_FORMATS.TIEBREAKS_ONLY_BEST_OF_5}>Tiebreaks Only (Best of 5)</option>
            <option value={MATCH_FORMATS.CUSTOM}>Custom Rules...</option>
          </select>
        </div>

        {config.format === MATCH_FORMATS.CUSTOM && (
          <div className="card" style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Custom Rules</h4>
            
            <label>Sets to win match</label>
            <input type="number" min="1" value={customRules.setsToWin} onChange={e => setCustomRules({...customRules, setsToWin: parseInt(e.target.value) || 1})} />
            
            <label>Games to win a set</label>
            <input type="number" min="1" value={customRules.gamesToWinSet} onChange={e => setCustomRules({...customRules, gamesToWinSet: parseInt(e.target.value) || 1})} />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
              <input type="checkbox" checked={customRules.winSetByTwo} onChange={e => setCustomRules({...customRules, winSetByTwo: e.target.checked})} style={{ width: 'auto', marginBottom: 0 }} />
              Win set by 2 games difference
            </label>

            <label>Play Tiebreak at what score? (0 for no tiebreak)</label>
            <input type="number" min="0" value={customRules.tiebreakAt} onChange={e => setCustomRules({...customRules, tiebreakAt: parseInt(e.target.value) || 0})} />
            
            {customRules.tiebreakAt > 0 && (
              <>
                <label>Tiebreak points to win</label>
                <input type="number" min="1" value={customRules.tiebreakPoints} onChange={e => setCustomRules({...customRules, tiebreakPoints: parseInt(e.target.value) || 1})} />
              </>
            )}

            {customRules.setsToWin > 1 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={customRules.finalSetSuperTiebreak} onChange={e => setCustomRules({...customRules, finalSetSuperTiebreak: e.target.checked})} style={{ width: 'auto', marginBottom: 0 }} />
                Final set is a Match Tiebreak
              </label>
            )}

            {customRules.setsToWin > 1 && customRules.finalSetSuperTiebreak && (
              <>
                <label>Match Tiebreak points to win</label>
                <input type="number" min="1" value={customRules.superTiebreakPoints} onChange={e => setCustomRules({...customRules, superTiebreakPoints: parseInt(e.target.value) || 1})} />
              </>
            )}
          </div>
        )}

        {config.format !== MATCH_FORMATS.CUSTOM && !config.format.startsWith('TIEBREAKS_ONLY') && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Set Format</label>
            <select 
              value={config.setFormat}
              onChange={e => setConfig({...config, setFormat: e.target.value})}
            >
              <option value={SET_FORMATS.TIEBREAK_AT_6_6}>Normal (Tiebreak at 6-6)</option>
              <option value={SET_FORMATS.SUPER_TIEBREAK_3RD_SET}>10-pt Match Tiebreak (Final Set)</option>
              <option value={SET_FORMATS.PLAY_OUT}>Play Out (Win by 2 games)</option>
              <option value={SET_FORMATS.FAST_4_TB_3_3}>Fast4 (First to 4, Tiebreak at 3-3)</option>
              <option value={SET_FORMATS.SHORT_SET_4_TB_4_4}>Short Set (First to 4, Tiebreak at 4-4)</option>
              <option value={SET_FORMATS.SHORT_SET_4_TB_5_5}>Short Set (First to 4, Tiebreak at 5-5)</option>
              <option value={SET_FORMATS.PRO_SET_8_TB_8_8}>Pro Set to 8 (Tiebreak at 8-8)</option>
              <option value={SET_FORMATS.PRO_SET_10_TB_10_10}>Pro Set to 10 (Tiebreak at 10-10)</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Game Format</label>
          <select 
            value={config.gameFormat}
            onChange={e => setConfig({...config, gameFormat: e.target.value})}
          >
            <option value={GAME_FORMATS.ADVANTAGE}>Advantage (Ad-Scoring)</option>
            <option value={GAME_FORMATS.NO_AD}>No-Ad Scoring (Golden Point)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Play size={20} /> Start
          </button>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleLiveHost}>
            <Radio size={20} /> Host Live
          </button>
        </div>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
        <h3>Join Live Match</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Enter the match code to watch a live game.</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Match Code (e.g. ABC-123)" 
            value={liveCode}
            onChange={e => setLiveCode(e.target.value.toUpperCase())}
            style={{ marginBottom: 0 }}
          />
          <button type="button" className="btn btn-primary" onClick={() => onJoinLive(liveCode)} disabled={!liveCode}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupMatch;
