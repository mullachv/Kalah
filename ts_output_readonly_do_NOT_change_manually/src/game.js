var game;
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
        resizeGameAreaService.setWidthToHeight(1.93);
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
        RULES_SLIDE2: "Game ends when either one of the sides is empty.",
        RULES_SLIDE3: "If the last sown seed is in store, player's turn continues.",
        RULES_SLIDE4: "If the last sown seed is in one's own empty house, then the player collects all the seeds from the opposite house (opponent's) and one's last sown seed.",
        CLOSE: "Close"
    });
    game.init();
});
