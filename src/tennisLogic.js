export const MATCH_FORMATS = {
  BEST_OF_3: "BEST_OF_3",
  BEST_OF_5: "BEST_OF_5",
  ONE_SET: "ONE_SET",
  TIEBREAKS_ONLY_BEST_OF_3: "TIEBREAKS_ONLY_BEST_OF_3",
  TIEBREAKS_ONLY_BEST_OF_5: "TIEBREAKS_ONLY_BEST_OF_5",
  CUSTOM: "CUSTOM",
};

export const SET_FORMATS = {
  TIEBREAK_AT_6_6: "TIEBREAK_AT_6_6",
  PLAY_OUT: "PLAY_OUT", // e.g. Wimbledon old rules, win by 2
  SUPER_TIEBREAK_3RD_SET: "SUPER_TIEBREAK_3RD_SET", // 3rd set is a 10-point tiebreak
  SHORT_SET_4_TB_4_4: "SHORT_SET_4_TB_4_4", // First to 4, Tiebreak at 4-4
  SHORT_SET_4_TB_5_5: "SHORT_SET_4_TB_5_5", // First to 4, Tiebreak at 5-5
  FAST_4_TB_3_3: "FAST_4_TB_3_3", // Fast4: First to 4, Tiebreak at 3-3
  PRO_SET_8_TB_8_8: "PRO_SET_8_TB_8_8", // Pro set to 8, Tiebreak at 8-8
  PRO_SET_10_TB_10_10: "PRO_SET_10_TB_10_10", // Pro set to 10, Tiebreak at 10-10
  CUSTOM: "CUSTOM",
};

export const GAME_FORMATS = {
  ADVANTAGE: "ADVANTAGE",
  NO_AD: "NO_AD",
};

// Initial state for a match
export const createMatchState = (config) => {
  const isDoubles = config.isDoubles || false;
  const serverSequence = isDoubles 
    ? (config.player1StartsServing !== false ? [1, 2, 3, 4] : [2, 1, 4, 3])
    : (config.player1StartsServing !== false ? [1, 2] : [2, 1]);
    
  return {
    config: {
      format: config.format || MATCH_FORMATS.BEST_OF_3,
      setFormat: config.setFormat || SET_FORMATS.TIEBREAK_AT_6_6,
      gameFormat: config.gameFormat || GAME_FORMATS.ADVANTAGE,
      customRules: config.customRules || null,
      isDoubles,
      player1Name: config.player1Name || "Player 1",
      player2Name: config.player2Name || "Player 2",
      player3Name: config.player3Name || "Player 3", // For doubles
      player4Name: config.player4Name || "Player 4", // For doubles
      player1StartsServing: config.player1StartsServing !== false,
    },
    status: "IN_PROGRESS", // IN_PROGRESS, COMPLETED
    winner: null, // Will be 1 (Team 1) or 2 (Team 2)
    currentSet: 0,
    sets: [{ player1: 0, player2: 0 }],
    currentGame: {
      player1: 0,
      player2: 0,
      isTiebreak: (config.format || MATCH_FORMATS.BEST_OF_3).startsWith("TIEBREAKS_ONLY"),
      isSuperTiebreak: false,
    },
    serverSequence,
    serverIndex: 0,
    server: serverSequence[0],
    firstServeFault: false,
    stats: {
      player1: { aces: 0, doubleFaults: 0, winners: 0, unforcedErrors: 0, forcedErrors: 0, firstServesTotal: 0, firstServesIn: 0, secondServesTotal: 0, secondServesIn: 0, pointsWon: 0 },
      player2: { aces: 0, doubleFaults: 0, winners: 0, unforcedErrors: 0, forcedErrors: 0, firstServesTotal: 0, firstServesIn: 0, secondServesTotal: 0, secondServesIn: 0, pointsWon: 0 },
      player3: { aces: 0, doubleFaults: 0, winners: 0, unforcedErrors: 0, forcedErrors: 0, firstServesTotal: 0, firstServesIn: 0, secondServesTotal: 0, secondServesIn: 0, pointsWon: 0 },
      player4: { aces: 0, doubleFaults: 0, winners: 0, unforcedErrors: 0, forcedErrors: 0, firstServesTotal: 0, firstServesIn: 0, secondServesTotal: 0, secondServesIn: 0, pointsWon: 0 },
    },
    history: [], // For undo functionality
  };
};

export const getDisplayScore = (score, isTiebreak) => {
  if (isTiebreak) return score.toString();
  switch (score) {
    case 0:
      return "0";
    case 1:
      return "15";
    case 2:
      return "30";
    case 3:
      return "40";
    case 4:
      return "Ad";
    default:
      return score.toString();
  }
};

const cloneState = (state) => JSON.parse(JSON.stringify(state));

export const addPoint = (currentState, actionPlayerId, reason, isFirstServe) => {
  if (currentState.status === "COMPLETED") return currentState;

  const state = cloneState(currentState);
  
  const actionTeamId = (actionPlayerId === 1 || actionPlayerId === 3) ? 1 : 2;
  const oppTeamId = actionTeamId === 1 ? 2 : 1;
  
  let pointWinnerTeamId;
  if (reason === "WINNER" || reason === "ACE") {
    pointWinnerTeamId = actionTeamId;
  } else {
    pointWinnerTeamId = oppTeamId;
  }
  const pointLoserTeamId = pointWinnerTeamId === 1 ? 2 : 1;

  const pId = `player${actionPlayerId}`;
  const serverId = `player${state.server}`;

  // Save to history before modifying
  const historySnapshot = cloneState(currentState);
  delete historySnapshot.history;
  state.history.push(historySnapshot);

  // Update Stats
  if (reason === "ACE") {
    state.stats[pId].aces += 1;
    state.stats[pId].winners += 1;
    state.stats[serverId].firstServesTotal += 1;
    state.stats[serverId].firstServesIn += 1;
    state.firstServeFault = false;
  } else if (reason === "DOUBLE_FAULT") {
    state.stats[serverId].doubleFaults += 1;
    state.stats[serverId].secondServesTotal += 1;
    state.firstServeFault = false;
  } else {
    if (reason === "WINNER") {
      state.stats[pId].winners += 1;
    } else if (reason === "UNFORCED_ERROR") {
      state.stats[pId].unforcedErrors += 1;
    } else if (reason === "FORCED_ERROR") {
      state.stats[pId].forcedErrors += 1;
    }

    // Serve stats
    if (state.firstServeFault) {
      state.stats[serverId].secondServesTotal += 1;
      state.stats[serverId].secondServesIn += 1;
      state.firstServeFault = false;
    } else {
      state.stats[serverId].firstServesTotal += 1;
      state.stats[serverId].firstServesIn += 1;
    }
  }

  state.stats[`player${pointWinnerTeamId}`].pointsWon += 1;
  if (state.config.isDoubles) {
    state.stats[`player${pointWinnerTeamId === 1 ? 3 : 4}`].pointsWon += 1;
  }

  // Score Logic
  const game = state.currentGame;
  const isTiebreak = game.isTiebreak;
  const isSuperTiebreak = game.isSuperTiebreak;

  game[`player${pointWinnerTeamId}`] += 1;

  let gameWon = false;

  if (isSuperTiebreak) {
    const pointsToWin =
      state.config.format === MATCH_FORMATS.CUSTOM &&
      state.config.customRules?.superTiebreakPoints
        ? state.config.customRules.superTiebreakPoints
        : 10;
    if (
      game[`player${pointWinnerTeamId}`] >= pointsToWin &&
      game[`player${pointWinnerTeamId}`] - game[`player${pointLoserTeamId}`] >= 2
    ) {
      gameWon = true;
    } else {
      // Alternate serves in tiebreak
      const totalPoints = game.player1 + game.player2;
      if (totalPoints % 2 === 1) {
        state.serverIndex = (state.serverIndex + 1) % state.serverSequence.length;
        state.server = state.serverSequence[state.serverIndex];
      }
    }
  } else if (isTiebreak) {
    const pointsToWin =
      state.config.format === MATCH_FORMATS.CUSTOM &&
      state.config.customRules?.tiebreakPoints
        ? state.config.customRules.tiebreakPoints
        : 7;
    if (
      game[`player${pointWinnerTeamId}`] >= pointsToWin &&
      game[`player${pointWinnerTeamId}`] - game[`player${pointLoserTeamId}`] >= 2
    ) {
      gameWon = true;
    } else {
      const totalPoints = game.player1 + game.player2;
      if (totalPoints % 2 === 1) {
        state.serverIndex = (state.serverIndex + 1) % state.serverSequence.length;
        state.server = state.serverSequence[state.serverIndex];
      }
    }
  } else {
    // Normal game
    const wScore = game[`player${pointWinnerTeamId}`];
    const lScore = game[`player${pointLoserTeamId}`];

    if (wScore >= 4) {
      if (state.config.gameFormat === GAME_FORMATS.NO_AD) {
        gameWon = true;
      } else {
        if (wScore - lScore >= 2) {
          gameWon = true;
        } else if (wScore === 4 && lScore === 4) {
          // Deuce -> return to 40-40 (which is 3-3)
          game.player1 = 3;
          game.player2 = 3;
        }
      }
    }
  }

  if (gameWon) {
    state.sets[state.currentSet][`player${pointWinnerTeamId}`] += 1;

    // Reset game
    state.currentGame = {
      player1: 0,
      player2: 0,
      isTiebreak: false,
      isSuperTiebreak: false,
    };

    // Switch server
    state.serverIndex = (state.serverIndex + 1) % state.serverSequence.length;
    state.server = state.serverSequence[state.serverIndex];

    // Check Set Won
    const currentSet = state.sets[state.currentSet];
    let setWon = false;
    let setFormatToUse = state.config.setFormat;

    if (state.config.format.startsWith("TIEBREAKS_ONLY")) {
      setWon = true; // Every set is just a tiebreak
    } else if (isSuperTiebreak) {
      setWon = true; // Super tiebreak is the whole set
    } else {
      let gamesToWin = 6;
      let tbScore = 6;

      if (setFormatToUse === SET_FORMATS.SHORT_SET_4_TB_4_4) {
        gamesToWin = 4;
        tbScore = 4;
      } else if (setFormatToUse === SET_FORMATS.SHORT_SET_4_TB_5_5) {
        gamesToWin = 4;
        tbScore = 5;
      } else if (setFormatToUse === SET_FORMATS.FAST_4_TB_3_3) {
        gamesToWin = 4;
        tbScore = 3;
      } else if (setFormatToUse === SET_FORMATS.PRO_SET_8_TB_8_8) {
        gamesToWin = 8;
        tbScore = 8;
      } else if (setFormatToUse === SET_FORMATS.PRO_SET_10_TB_10_10) {
        gamesToWin = 10;
        tbScore = 10;
      } else if (
        setFormatToUse === SET_FORMATS.CUSTOM &&
        state.config.customRules
      ) {
        gamesToWin = state.config.customRules.gamesToWinSet;
        tbScore = state.config.customRules.tiebreakAt;
      }

      if (currentSet[`player${pointWinnerTeamId}`] >= Math.min(gamesToWin, tbScore)) {
        const needsMargin =
          setFormatToUse === SET_FORMATS.CUSTOM && state.config.customRules
            ? state.config.customRules.winSetByTwo
            : true;

        if (
          currentSet[`player${pointWinnerTeamId}`] >= gamesToWin &&
          (!needsMargin ||
            currentSet[`player${pointWinnerTeamId}`] - currentSet[`player${pointLoserTeamId}`] >=
              2)
        ) {
          setWon = true;
        } else if (
          currentSet[`player${pointWinnerTeamId}`] === tbScore + 1 &&
          tbScore < gamesToWin
        ) {
          setWon = true; // Won tiebreak
        } else if (
          currentSet[`player${pointWinnerTeamId}`] === tbScore &&
          currentSet[`player${pointLoserTeamId}`] === tbScore
        ) {
          if (tbScore > 0) {
            // If tbScore is 0, they play play-out? No, just no tiebreak.
            state.currentGame.isTiebreak = true;
          }
        }
      }
    }

    if (setWon) {
      // Check Match Won
      const setsWon = { player1: 0, player2: 0 };
      state.sets.forEach((s) => {
        if (s.player1 > s.player2) setsWon.player1++;
        if (s.player2 > s.player1) setsWon.player2++;
      });

      let matchWon = false;
      const format = state.config.format;

      if (
        format === MATCH_FORMATS.ONE_SET &&
        setsWon[`player${pointWinnerTeamId}`] === 1
      )
        matchWon = true;
      if (
        format === MATCH_FORMATS.BEST_OF_3 ||
        format === MATCH_FORMATS.TIEBREAKS_ONLY_BEST_OF_3
      ) {
        if (setsWon[`player${pointWinnerTeamId}`] === 2) matchWon = true;
      }
      if (
        format === MATCH_FORMATS.BEST_OF_5 ||
        format === MATCH_FORMATS.TIEBREAKS_ONLY_BEST_OF_5
      ) {
        if (setsWon[`player${pointWinnerTeamId}`] === 3) matchWon = true;
      }
      if (format === MATCH_FORMATS.CUSTOM && state.config.customRules) {
        if (setsWon[`player${pointWinnerTeamId}`] === state.config.customRules.setsToWin)
          matchWon = true;
      }

      if (matchWon) {
        state.status = "COMPLETED";
        state.winner = pointWinnerTeamId;
      } else {
        // Next Set
        state.currentSet += 1;
        state.sets.push({ player1: 0, player2: 0 });

        if (format.startsWith("TIEBREAKS_ONLY")) {
          state.currentGame.isTiebreak = true;
        } else if (
          format === MATCH_FORMATS.BEST_OF_3 &&
          state.currentSet === 2 &&
          state.config.setFormat === SET_FORMATS.SUPER_TIEBREAK_3RD_SET
        ) {
          state.currentGame.isSuperTiebreak = true;
        } else if (
          format === MATCH_FORMATS.CUSTOM &&
          state.config.customRules
        ) {
          const finalSetIndex = state.config.customRules.setsToWin * 2 - 2; // For best of 3 (setsToWin=2), final is set index 2.
          if (
            state.config.customRules.finalSetSuperTiebreak &&
            state.currentSet === finalSetIndex
          ) {
            state.currentGame.isSuperTiebreak = true;
          }
        }
      }
    }
  }

  return state;
};

export const registerFault = (currentState) => {
  if (currentState.status === "COMPLETED") return currentState;
  const state = cloneState(currentState);

  // Save to history before modifying
  const historySnapshot = cloneState(currentState);
  delete historySnapshot.history;
  state.history.push(historySnapshot);

  const serverId = `player${state.server}`;

  if (state.firstServeFault) {
    // Double fault! Opponent wins point.
    state.firstServeFault = false; // Reset for next history state because it will be handled by addPoint
    // Revert history push since addPoint handles it, actually we pop it and let addPoint do it.
    state.history.pop();
    return addPoint(currentState, state.server, "DOUBLE_FAULT");
  } else {
    state.firstServeFault = true;
    state.stats[serverId].firstServesTotal += 1;
  }
  return state;
};

export const undoLastAction = (currentState) => {
  if (!currentState.history || currentState.history.length === 0)
    return currentState;
  const state = cloneState(currentState);
  const previousState = state.history.pop();
  previousState.history = state.history; // Restore history array
  return previousState;
};
