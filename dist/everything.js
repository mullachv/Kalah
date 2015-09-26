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
        //zero out the house from which seeds will be taken to be sown
        boardAfterMove.boardSides[turnIndexBeforeMove].house[bd.house] = 0;
        var lastVisitedLocn;
        lastVisitedLocn.store = false;
        while (bd.nitems > 0) {
            if (boardAfterMove.boardSides[turnIndexBeforeMove].sowDir ===
                SowDirType.RtoL) {
                lastVisitedLocn.sowDir = SowDirType.RtoL;
            }
            else {
                lastVisitedLocn.sowDir = SowDirType.LtoR;
            }
            for (var i = bd.house + 1; i < NUM_HOUSES; i++) {
                boardAfterMove.boardSides[turnIndexBeforeMove].house[bd.house]++;
                bd.nitems--;
                lastVisitedLocn.houseNum = i;
                lastVisitedLocn.store = false;
                if (bd.nitems === 0) {
                    break;
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
                firstOperation = { setTurn: { turnIndex: 1 - svTurnIndexBeforeMove } };
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
;var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var state = null;
    var turnIndex = null;
    game.isHelpModalShown = false;
    function init() {
        console.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        gameService.makeMove(aiService.createComputerMove(state.board, turnIndex, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 }));
    }
    function updateUI(params) {
        animationEnded = false;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard();
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        isComputerTurn = canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    function cellClicked(row, col) {
        log.info(["Clicked on cell:", row, col]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
            return;
        }
        try {
            var move = gameLogic.createMove(state.board, row, col, turnIndex);
            canMakeMove = false; // to prevent making another move
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["Cell is already full in position:", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        var cell = state.board[row][col];
        return cell !== "";
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceX(row, col) {
        return state.board[row][col] === 'X';
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col) {
        return state.board[row][col] === 'O';
    }
    game.isPieceO = isPieceO;
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.delta &&
            state.delta.row === row && state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap'])
    .run(['initGameServices', function (initGameServices) {
        $rootScope['game'] = game;
        translate.setLanguage('en', {
            RULES_OF_TICTACTOE: "Rules of TicTacToe",
            RULES_SLIDE1: "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
            RULES_SLIDE2: "The first to mark a whole row, column or diagonal wins.",
            CLOSE: "Close"
        });
        game.init();
    }]);
;var aiService;
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
        window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
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
        return gameLogic.getPossibleMoves(move[1].set.value, playerIndex);
    }
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
