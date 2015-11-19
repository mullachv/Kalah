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
        var side1 = {
            store: 0,
            house: [4, 4, 4, 4, 4, 4],
            sowDir: SowDirType.RtoL
        };
        var side0 = {
            store: 0,
            house: [4, 4, 4, 4, 4, 4],
            sowDir: SowDirType.LtoR
        };
        var initialBoard = {
            boardSides: [side0, side1]
        };
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
        if (IsSideEmpty(board.boardSides[0]) ||
            IsSideEmpty(board.boardSides[1])) {
            return (houseAndStoreTotal(board.boardSides[0]) > Math.floor(MAXSEEDS / 2)
                ? board.boardSides[0] : board.boardSides[1]);
        }
        return null;
    }
    /**
     * Test changes for simpleTst.html
    */
    // export function TestFunc() {
    //   var bDel:BoardDelta = {boardSideId: 0, house: 0, nitems: 4};
    //   var move:IMove = gameLogic.createMove(undefined, bDel, 0);
    //   console.log("move=", move);
    //   var params:IIsMoveOk = <IIsMoveOk>{turnIndexBeforeMove: 0,
    //     stateBeforeMove: {},
    //     move: move};
    //   var res = gameLogic.isMoveOk(params);
    //   console.log("params=", params, "result=", res);
    //
    // }
    //
    // export function secondTest(turnIndexBeforeMove: number, stateBeforeMove: IState,
    //             move: IMove, isOk: boolean) {
    //   var res = isMoveOk({
    //     turnIndexBeforeMove: turnIndexBeforeMove,
    //     turnIndexAfterMove: null,
    //     stateBeforeMove: stateBeforeMove,
    //     stateAfterMove: null,
    //     move: move,
    //     numberOfPlayers: null});
    //     console.log("res: " + res);
    // }
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
        // if (bd.boardSideId !== turnIndexBeforeMove) {
        //   throw new Error("Playing out of turn?");
        // }
        if (bd.nitems === 0) {
            throw new Error("Sowing zero seeds?");
        }
        //save a few vars
        var wkdelta = angular.copy(bd);
        var boardAfterMove = angular.copy(board);
        var svTurnIndexBeforeMove = turnIndexBeforeMove;
        var svNItems = wkdelta.nitems;
        var svSowDir = board.boardSides[turnIndexBeforeMove].sowDir;
        //zero out the house from which seeds will be taken to be sown
        boardAfterMove.boardSides[turnIndexBeforeMove].house[wkdelta.house] = 0;
        var lastVisitedLocn = { sowDir: undefined,
            houseNum: undefined, store: false };
        var startHouse = wkdelta.house + 1;
        while (wkdelta.nitems > 0) {
            if (boardAfterMove.boardSides[turnIndexBeforeMove].sowDir ===
                SowDirType.RtoL) {
                lastVisitedLocn.sowDir = SowDirType.RtoL;
            }
            else {
                lastVisitedLocn.sowDir = SowDirType.LtoR;
            }
            for (var i = startHouse; i < NUM_HOUSES; i++) {
                boardAfterMove.boardSides[turnIndexBeforeMove].house[i]++;
                wkdelta.nitems--;
                lastVisitedLocn.houseNum = i;
                lastVisitedLocn.store = false;
                if (wkdelta.nitems === 0) {
                    break;
                }
            }
            if ((wkdelta.nitems > 0) && (svTurnIndexBeforeMove === turnIndexBeforeMove)) {
                boardAfterMove.boardSides[turnIndexBeforeMove].store++;
                lastVisitedLocn.houseNum = NUM_HOUSES; //invalid house num
                lastVisitedLocn.store = true;
                wkdelta.nitems--;
            }
            turnIndexBeforeMove = 1 - turnIndexBeforeMove; //sow on the other side now
            startHouse = 0;
        } //while
        //if last location was one's own house and was empty,
        //then capture all of the seeds from the opponent's house and one's own house
        // into one's store.
        if (!lastVisitedLocn.store
            && (lastVisitedLocn.sowDir === svSowDir)
            && (boardAfterMove.boardSides[svTurnIndexBeforeMove].house[lastVisitedLocn.houseNum] === 1)) {
            //Do this ONLY if the opponent's house is non-empty - Oct 29, 2015
            if (boardAfterMove.boardSides[1 - svTurnIndexBeforeMove]
                .house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum] > 0) {
                //get the opponent's seeds and your own (+1)
                boardAfterMove.boardSides[svTurnIndexBeforeMove].store +=
                    boardAfterMove.boardSides[1 - svTurnIndexBeforeMove]
                        .house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum]
                        +
                            1;
                //set own to zero
                boardAfterMove.boardSides[svTurnIndexBeforeMove]
                    .house[lastVisitedLocn.houseNum] = 0;
                //set opponent's to zero
                boardAfterMove.boardSides[1 - svTurnIndexBeforeMove]
                    .house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum] = 0;
            }
        }
        var winner = getWinner(boardAfterMove);
        var firstOperation;
        if (isTie(boardAfterMove)) {
            //Game over
            firstOperation = { endMatch: { endMatchScores: [0, 0] } };
        }
        else if (winner !== null) {
            // Game over
            firstOperation = { endMatch: { endMatchScores: winner.sowDir === SowDirType.LtoR ? [1, 0] : [0, 1] } };
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
        var delta = angular.copy(bd);
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'delta', value: delta } }];
    }
    gameLogic.createMove = createMove;
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that move is legal.
        try {
            // Example move:
            // [{setTurn: {turnIndex : 1},
            //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
            //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
            var deltaValue = move[2].set.value;
            var passDeltaValue = angular.copy(deltaValue);
            //console.log(JSON.stringify(move[2].set.value));
            var board = stateBeforeMove.board;
            var expectedMove = createMove(board, passDeltaValue, turnIndexBeforeMove);
            // console.log(JSON.stringify( move));
            // console.log(JSON.stringify(expectedMove));
            // console.log(JSON.stringify(move[1].set.value));
            //console.log(JSON.stringify(move[2].set.value));
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
    var stateBefore = null;
    var turnIndex = null;
    game.isHelpModalShown = false;
    var INIT_SEED_COUNT_PER_HOUSE = 4;
    var MAX_ROWS_IN_A_HOUSE = 8;
    var flipMode = false; //board side switching in display
    function init() {
        console.log("Translation of 'RULES_OF_KALAH' is " + translate('RULES_OF_KALAH'));
        resizeGameAreaService.setWidthToHeight(1.67);
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
        // To make sure we send the computer move just once
        if (!isComputerTurn) {
            return;
        }
        isComputerTurn = false;
        $timeout(function () {
            //console.log("In Send comp move");
            gameService.makeMove(aiService.createComputerMove(state.board, turnIndex, 
            // at most 1 second for the AI to choose a move (but might be much quicker)
            { millisecondsLimit: 1000 }));
        }, 500);
    }
    function updateUI(params) {
        animationEnded = false;
        state = params.stateAfterMove;
        stateBefore = params.stateBeforeMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard();
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // console.log("IUpdate UI");
        console.log("upd ui: " + JSON.stringify(params));
        // Is it the computer's turn?
        isComputerTurn = canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            console.log("" + JSON.stringify(state));
            //  if (!state.delta) {
            // This is the first move in the match, so
            // there is not going to be an animation, so
            // call sendComputerMove() now (can happen in ?onlyAIs mode)
            sendComputerMove();
        }
        //playMode = 1 means your playerIndex = 1 (in a multiplayer mode)
        flipMode = params.playMode === 1;
        console.log("flip: " + flipMode);
    }
    function shouldFlipDisplay() {
        return flipMode;
    }
    game.shouldFlipDisplay = shouldFlipDisplay;
    function getStoreCount(side) {
        //console.log("Store count called: " + side + "num: " + state.board.boardSides[side].store);
        return state.board.boardSides[side].store;
    }
    game.getStoreCount = getStoreCount;
    function getStoreCountAsArray(side) {
        var narr = [];
        var stCount = getStoreCount(side);
        for (var c = 1; c <= stCount; c++) {
            narr.push(c);
        }
        return narr;
    }
    game.getStoreCountAsArray = getStoreCountAsArray;
    function getHouseSeedCount(side, house) {
        if (!shouldFlipDisplay()) {
            if (side === 1) {
                house = NUM_HOUSES - 1 - house;
            }
            return state.board.boardSides[side].house[house];
        }
        else {
            if (side === 0) {
                house = NUM_HOUSES - 1 - house;
            }
            return state.board.boardSides[side].house[house];
        }
    }
    game.getHouseSeedCount = getHouseSeedCount;
    function getHouseSeedCountAsArray(side, house) {
        var narr = [];
        var stCount = getHouseSeedCount(side, house);
        for (var c = 1; c <= stCount; c++) {
            narr.push(c);
        }
        //console.log("stc: " + stCount);
        //console.log("narr: " + JSON.stringify(narr));
        return narr;
    }
    game.getHouseSeedCountAsArray = getHouseSeedCountAsArray;
    var seedInStore = [
        { t: 51, l: 52 },
        { t: 49, l: 23 },
        { t: 53, l: 44 },
        { t: 57, l: 35 },
        { t: 45, l: 37 },
        { t: 35, l: 80 },
        { t: 58, l: 66 },
        { t: 72, l: 16 },
        { t: 78, l: 19 },
        { t: 83, l: 36 },
        { t: 65, l: 47 },
        { t: 64, l: 45 },
        { t: 23, l: 72 },
        { t: 43, l: 75 },
        { t: 56, l: 72 },
        { t: 89, l: 43 },
        { t: 84, l: 37 },
        { t: 77, l: 23 },
        { t: 62, l: 13 },
        { t: 11, l: 19 },
        { t: 83, l: 25 },
        { t: 53, l: 27 },
        { t: 44, l: 37 },
        { t: 37, l: 32 },
        { t: 17, l: 41 },
        { t: 56, l: 42 },
        { t: 62, l: 48 },
        { t: 56, l: 49 },
        { t: 51, l: 58 },
        { t: 27, l: 56 },
        { t: 29, l: 14 },
        { t: 27, l: 62 },
        { t: 28, l: 67 },
        { t: 35, l: 2 },
        { t: 42, l: 8 },
        { t: 44, l: 8 },
        { t: 43, l: 72 },
        { t: 67, l: 67 },
        { t: 56, l: 13 },
        { t: 55, l: 31 },
        { t: 67, l: 14 },
        { t: 66, l: 19 },
        { t: 62, l: 27 },
        { t: 73, l: 42 },
        { t: 74, l: 35 },
        { t: 81, l: 3 },
        { t: 89, l: 38 },
        { t: 12, l: 76 }
    ];
    var storeStyleVal = {
        position: 'absolute',
        width: '20%',
        height: '10%',
        top: '%',
        left: '%'
    };
    function getStoreSeedStyle(seed) {
        var td = seedInStore[seed].t;
        var ld = seedInStore[seed].l;
        storeStyleVal.top = td + '%';
        storeStyleVal.left = ld + '%';
        return storeStyleVal;
    }
    game.getStoreSeedStyle = getStoreSeedStyle;
    var seedInHouse = [
        { t: 51, l: 52 },
        { t: 49, l: 23 },
        { t: 53, l: 44 },
        { t: 57, l: 35 },
        { t: 45, l: 37 },
        { t: 35, l: 80 },
        { t: 58, l: 66 },
        { t: 62, l: 16 },
        { t: 68, l: 19 },
        { t: 23, l: 36 },
        { t: 65, l: 47 },
        { t: 64, l: 45 },
        { t: 23, l: 72 },
        { t: 43, l: 75 },
        { t: 56, l: 72 },
        { t: 19, l: 43 },
        { t: 44, l: 37 },
        { t: 77, l: 23 },
        { t: 62, l: 13 },
        { t: 11, l: 19 },
        { t: 33, l: 25 },
        { t: 53, l: 27 },
        { t: 44, l: 37 },
        { t: 37, l: 32 },
        { t: 17, l: 41 }
    ];
    var houseSeedStyleVal = {
        position: 'absolute',
        width: '20%',
        height: '20%',
        top: '%',
        left: '%'
    };
    function getHouseSeedStyle(seed) {
        var td = seedInHouse[seed].t;
        var ld = seedInHouse[seed].l;
        houseSeedStyleVal.top = td + '%';
        houseSeedStyleVal.left = ld + '%';
        return houseSeedStyleVal;
    }
    game.getHouseSeedStyle = getHouseSeedStyle;
    function isKalahInStore(boardside, storeRowNum, storeColNum) {
        var impliedCount = storeRowNum * 2 + storeColNum + 1;
        if (state.board.boardSides[boardside].store >= impliedCount) {
            return true;
        }
        return false;
    }
    game.isKalahInStore = isKalahInStore;
    function getStoreDisplayRowArray() {
        var rows = [];
        for (var i = 0; i < MAXSEEDS / 2; i++) {
            rows[i] = i;
        }
        return rows;
    }
    game.getStoreDisplayRowArray = getStoreDisplayRowArray;
    //0 to 5
    function getHouseArray() {
        var hs = [];
        for (var i = 0; i < NUM_HOUSES; i++) {
            hs[i] = i;
        }
        return hs;
    }
    game.getHouseArray = getHouseArray;
    //0 to 7 (display rows in a house)
    function getHouseRowArray() {
        var hs = [];
        for (var i = 0; i < MAX_ROWS_IN_A_HOUSE; i++) {
            hs[i] = i;
        }
        return hs;
    }
    game.getHouseRowArray = getHouseRowArray;
    function houseClicked(side, hnum) {
        if (!canMakeMove) {
            return;
        }
        if (turnIndex != side) {
            return;
        }
        if (!shouldFlipDisplay()) {
            if (side === 1) {
                hnum = NUM_HOUSES - 1 - hnum;
            }
        }
        else {
            if (side === 0) {
                hnum = NUM_HOUSES - 1 - hnum;
            }
        }
        var nSeeds = state.board.boardSides[side].house[hnum];
        if (nSeeds === 0) {
            return;
        }
        //row 0 ==> boardSideId = 0; row = 1 (near player), boardSideId = 1
        var bd = { boardSideId: side, house: hnum, nitems: nSeeds };
        try {
            var move = gameLogic.createMove(state.board, bd, turnIndex);
            canMakeMove = false; // to prevent making another move
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["Invalid move:", side, hnum]);
            return;
        }
    }
    game.houseClicked = houseClicked;
    function shouldSlowlyAppearInStore(side, row, col) {
        if (!state) {
            return false;
        }
        if (!stateBefore) {
            return false;
        }
        if (!stateBefore.board) {
            return false;
        }
        // console.log("before: " + JSON.stringify(stateBefore));
        // console.log("now: " + JSON.stringify(state));
        var hnum = col;
        if (!shouldFlipDisplay()) {
            if (side === 1) {
                hnum = NUM_HOUSES - 1 - hnum;
            }
        }
        else {
            if (side === 0) {
                hnum = NUM_HOUSES - 1 - hnum;
            }
        }
        var seedsBefore = stateBefore.board.boardSides[side].store;
        var seedsNow = state.board.boardSides[side].store;
        //console.log("now: " + seedsNow + " before: " + seedsBefore);
        if (seedsNow <= seedsBefore) {
            return false;
        }
        var impliedCount = row * 2 + col + 1;
        if (impliedCount > seedsBefore) {
            return true;
        }
        return false;
        // return !animationEnded &&
        //     state.delta &&
        //     state.delta.row === row && state.delta.col === col;
    }
    game.shouldSlowlyAppearInStore = shouldSlowlyAppearInStore;
    function shouldSlowlyAppearStoreCount(side) {
        if (!state) {
            return false;
        }
        if (!stateBefore) {
            return false;
        }
        if (!stateBefore.board) {
            return false;
        }
        var seedsBefore = stateBefore.board.boardSides[side].store;
        var seedsNow = state.board.boardSides[side].store;
        return seedsNow !== seedsBefore;
    }
    game.shouldSlowlyAppearStoreCount = shouldSlowlyAppearStoreCount;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_KALAH: "Rules of Kalah",
        RULES_SLIDE1: "Players take turns to sow the seeds anti-clockwise.",
        RULES_SLIDE2: "The one to collect more than 24 seeds in their store wins.",
        CLOSE: "Close"
    });
    game.init();
});
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
