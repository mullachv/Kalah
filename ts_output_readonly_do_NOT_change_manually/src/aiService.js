var aiService;
(function (aiService) {
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(board, playerIndex, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        // Recal that a TicTacToe move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: board } }], playerIndex, getNextStates, getStateScoreForIndex0, 
        // If you want to see debugging output in the console, then surf to game.html?debug
        // window.location.search === '?debug' ? getDebugStateToString : null,
        null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return aiService.getPossibleMoves(move[1].set.value, playerIndex);
    }
    // function getDebugStateToString(move: IMove): string {
    //   return "\n" + move[1].set.value.join("\n") + "\n";
    // }
    /**
     * Returns all the possible moves for the given board and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var j = 0; j < NUM_HOUSES; j++) {
            try {
                if (board.boardSides[turnIndexBeforeMove].house[j] !== 0) {
                    var bd = { boardSideId: turnIndexBeforeMove,
                        house: j,
                        nitems: board.boardSides[turnIndexBeforeMove].house[j]
                    };
                    possibleMoves.push(gameLogic.createMove(board, bd, turnIndexBeforeMove));
                }
            }
            catch (e) {
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
})(aiService || (aiService = {}));
