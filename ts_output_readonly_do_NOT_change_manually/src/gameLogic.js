var MAXSEEDS = 48;
var NUM_HOUSES = 6;
var SowDirType;
(function (SowDirType) {
    SowDirType[SowDirType["RtoL"] = 0] = "RtoL";
    SowDirType[SowDirType["LtoR"] = 1] = "LtoR";
})(SowDirType || (SowDirType = {}));
var gameLogic;
(function (gameLogic) {
    /** Returns the initial Kalah board, each side has each of their
     * houses filled with 4 seeds
     */
    function getInitialBoard() {
        var initialBoard;
        initialBoard.boardSides.push({
            store: 0,
            house: [4, 4, 4, 4, 4, 4],
            sowDir: SowDirType.RtoL
        });
        initialBoard.boardSides.push({
            store: 0,
            house: [4, 4, 4, 4, 4, 4],
            sowDir: SowDirType.LtoR
        });
        return initialBoard;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    /** sum of houses === 0 ? */
    function IsSideEmpty(side) {
        return (side.house.reduce(function (p, c) {
            return p + c;
        }) === 0);
    }
    /**
    * houses + store for the side
    */
    function houseAndStoreTotal(side) {
        return (side.house.reduce(function (p, c) {
            return p + c;
        }) + side.store);
    }
    /**
     * Returns true if the game ended in a tie
     * Either side is empty and the house and store total === MAXSEEDS/2
     */
    function isTie(board) {
        if (IsSideEmpty(board.boardSides[0]) ||
            IsSideEmpty(board.boardSides[1])) {
            return (houseAndStoreTotal(board.boardSides[0]) ===
                Math.floor(MAXSEEDS / 2));
        }
        return false;
    }
    /**
     * Return the winning side
     */
    function getWinner(board) {
        return (houseAndStoreTotal(board.boardSides[0]) > Math.floor(MAXSEEDS / 2)
            ? board.boardSides[0] : board.boardSides[1]);
    }
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
                    possibleMoves.push(createMove(board, bd, turnIndexBeforeMove));
                }
            }
            catch (e) {
            }
        }
        return possibleMoves;
    }
    gameLogic.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(board, bd, turnIndexBeforeMove) {
        if (!board) {
            // Initially (at the beginning of the match), the board in state is undefined.
            board = getInitialBoard();
        }
        if (isTie(board) || getWinner(board) !== null) {
            throw new Error("Can only make a move if the game is not over!");
        }
        if (bd.boardSideId !== turnIndexBeforeMove) {
            throw new Error("Playing out of turn?");
        }
        if (bd.nitems === 0) {
            throw new Error("Sowing zero seeds?");
        }
        //save a few vars
        var boardAfterMove = angular.copy(board);
        var svTurnIndexBeforeMove = turnIndexBeforeMove;
        var svNItems = bd.nitems;
        var svSowDir = board.boardSides[turnIndexBeforeMove].sowDir;
        boardAfterMove.boardSides[turnIndexBeforeMove].house[bd.house] = 0;
        var lastVisitedLocn;
        lastVisitedLocn.store = false;
        while (bd.nitems > 0) {
            if (boardAfterMove.boardSides[turnIndexBeforeMove].sowDir ===
                SowDirType.RtoL) {
                lastVisitedLocn.sowDir = SowDirType.RtoL;
                for (var i = bd.house - 1; i >= 0; i--) {
                    boardAfterMove.boardSides[turnIndexBeforeMove].house[bd.house]++;
                    bd.nitems--;
                    lastVisitedLocn.houseNum = i;
                    lastVisitedLocn.store = false;
                    if (bd.nitems === 0) {
                        break;
                    }
                }
            }
            else {
                lastVisitedLocn.sowDir = SowDirType.LtoR;
                for (var i = bd.house + 1; i < NUM_HOUSES; i++) {
                    boardAfterMove.boardSides[turnIndexBeforeMove].house[bd.house]++;
                    bd.nitems--;
                    lastVisitedLocn.houseNum = i;
                    lastVisitedLocn.store = false;
                    if (bd.nitems === 0) {
                        break;
                    }
                }
            }
            if ((bd.nitems > 0) && (svTurnIndexBeforeMove === turnIndexBeforeMove)) {
                boardAfterMove.boardSides[turnIndexBeforeMove].store++;
                lastVisitedLocn.houseNum = NUM_HOUSES; //invalid house num
                lastVisitedLocn.store = true;
                bd.nitems--;
            }
            turnIndexBeforeMove = 1 - turnIndexBeforeMove; //sow on the other side now
        } //while
        //if last location was one's own house and was empty,
        //then capture all of the seeds from the opponent's house and one's own house
        // into one's store
        if (!lastVisitedLocn.store && (lastVisitedLocn.sowDir === svSowDir) &&
            (boardAfterMove.boardSides[svTurnIndexBeforeMove].house[lastVisitedLocn.houseNum] === 1)) {
            //get the opponent's seeds and your own (+1)
            boardAfterMove.boardSides[svTurnIndexBeforeMove].store +=
                boardAfterMove.boardSides[1 - svTurnIndexBeforeMove].house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum]
                    + 1;
            //set own to zero
            boardAfterMove.boardSides[svTurnIndexBeforeMove].house[lastVisitedLocn.houseNum] = 0;
            //set opponent's to zero
            boardAfterMove.boardSides[1 - svTurnIndexBeforeMove].house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum] = 0;
        }
        var winner = getWinner(boardAfterMove);
        var firstOperation;
        if (isTie(boardAfterMove) || winner !== null) {
            // Game over.
            firstOperation = { endMatch: { endMatchScores: winner.sowDir === SowDirType.LtoR ? [0, 1] :
                        winner.sowDir === SowDirType.RtoL ? [1, 0] : [0, 0] } };
        }
        else {
            //check for move continuation - if you end in your own store
            if (lastVisitedLocn.store) {
                firstOperation = { setTurn: { turnIndex: svTurnIndexBeforeMove } };
            }
            else {
                // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
                firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
            }
        }
        var delta = bd;
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'delta', value: delta } }];
    }
    gameLogic.createMove = createMove;
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
        //var turnIndexAfterMove = params.turnIndexAfterMove;
        //var stateAfterMove = params.stateAfterMove;
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that move is legal.
        try {
            // Example move:
            // [{setTurn: {turnIndex : 1},
            //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
            //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
            var deltaValue = move[2].set.value;
            var board = stateBeforeMove.board;
            var expectedMove = createMove(board, deltaValue, turnIndexBeforeMove);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
