'use strict';

angular.module('myApp').factory('aiService', function(alphaBetaService, gameLogic) {

  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  function createComputerMove(board, playerIndex, alphaBetaLimits) {
    // Recal that a move has 3 operations:
    // 1) endMatch or setTurn
    // 2) {set: {key: 'board', value: ...}}
    // 3) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: board}}],
        playerIndex, getNextStates, getStateScoreForIndex0,
        null, //getDebugStateToString,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move) {
    if (move[0].endMatch) {
      var endMatchScores = move[0].endMatch.endMatchScores;
      return endMatchScores[0] - endMatchScores[1];
    }
    return 0;
  }

  function getNextStates(move, playerIndex) {
    return gameLogic.getPossibleMoves(move[1].set.value, playerIndex);
  }

  function getDebugStateToString(move) {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }

  return {createComputerMove: createComputerMove};
});