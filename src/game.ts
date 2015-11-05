module game {
  var animationEnded = false;
  var canMakeMove = false;
  var isComputerTurn = false;
  var state:IState = null;
  var stateBefore:IState = null;
  var turnIndex: number = null;
  export var isHelpModalShown: boolean = false;
  let INIT_SEED_COUNT_PER_HOUSE = 4;
  let MAX_ROWS_IN_A_HOUSE = 8;

  export function init() {
    console.log("Translation of 'RULES_OF_KALAH' is " + translate('RULES_OF_KALAH'));
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
    //console.log("In Send comp move");
    gameService.makeMove(
        aiService.createComputerMove(state.board, turnIndex,
          // at most 1 second for the AI to choose a move (but might be much quicker)
          {millisecondsLimit: 1000}));
  }

  function updateUI(params: IUpdateUI): void {
    animationEnded = false;
    state = params.stateAfterMove;
    stateBefore = params.stateBeforeMove;
    if (!state.board) {
      state.board = gameLogic.getInitialBoard();
    }
    canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
    turnIndex = params.turnIndexAfterMove;

    // console.log("IUpdate UI");
    // console.log("upd ui: " + JSON.stringify(params));

    // Is it the computer's turn?
    isComputerTurn = canMakeMove &&
        params.playersInfo[params.yourPlayerIndex].playerId === '';
    if (isComputerTurn) {
      // To make sure the player won't click something and send a move instead of the computer sending a move.
      canMakeMove = false;
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
    //  if (!state.delta) {
        // This is the first move in the match, so
        // there is not going to be an animation, so
        // call sendComputerMove() now (can happen in ?onlyAIs mode)
        sendComputerMove();
    //  }
    }
  }


  export function getStoreCount(side: number): number {
    return state.board.boardSides[side].store;
  }

  export function isKalahInStore(boardside: number, storeRowNum: number,
          storeColNum: number): Boolean {
    let impliedCount = storeRowNum * 2 + storeColNum+1;
    if (state.board.boardSides[boardside].store >= impliedCount) {
      return true;
    }
    return false;
  }

  export function getStoreDisplayRowArray() {
    let rows:number[] = [];
    for (var i = 0; i < MAXSEEDS/2; i++) {
        rows[i] = i;
    }
    return rows;
  }

  //0 to 5
  export function getHouseArray() {
    let hs:number[] = [];
    for (var i = 0; i < NUM_HOUSES; i++) {
        hs[i] = i;
    }
    return hs;
  }

  //0 to 7 (display rows in a house)
  export function getHouseRowArray() {
    let hs:number[] = [];
    for (var i = 0; i < MAX_ROWS_IN_A_HOUSE; i++) {
        hs[i] = i;
    }
    return hs;
  }

  //boardside: 0|1; house: 0..5, rnum: 0..7, cnum:0|1
  export function IsKalahInHouseCell(side:number, hnum:number,
      rnum: number, cnum: number) {
      //  console.log("IsKalahInHouseCell: ");
      let boardHouseNum = hnum;
      if (side === 1) {
        boardHouseNum = NUM_HOUSES - 1 - hnum;
      }

      let nSeeds = state.board.boardSides[side].house[boardHouseNum];
      let impliedCount = rnum * 2 + cnum+1;
      if (nSeeds >= impliedCount) {
        return true;
      }
      return false;
  }

  export function houseClicked(side:number, hnum: number):void {
    if (!canMakeMove) {
      return;
    }
    if (turnIndex != side) {
      return;
    }
    if (side === 1) {
      hnum = NUM_HOUSES - 1 - hnum;
    }

    let nSeeds = state.board.boardSides[side].house[hnum];
    if (nSeeds === 0) {
      return;
    }

    //row 0 ==> boardSideId = 0; row = 1 (near player), boardSideId = 1
    let bd:BoardDelta = {boardSideId: side, house: hnum, nitems: nSeeds};
    try {
      var move = gameLogic.createMove(state.board, bd, turnIndex);
      canMakeMove = false; // to prevent making another move
      gameService.makeMove(move);
    } catch (e) {
      log.info(["Invalid move:", side, hnum]);
      return;
    }

  }

  export function shouldSlowlyAppearInStore(side: number, row: number, col: number): boolean {
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
    let hnum = col;
    if (side === 1) {
      hnum = NUM_HOUSES - 1 - hnum;
    }
    let seedsBefore = stateBefore.board.boardSides[side].store;
    let seedsNow = state.board.boardSides[side].store;
    //console.log("now: " + seedsNow + " before: " + seedsBefore);

    if (seedsNow <= seedsBefore) {
      return false;
    }
    let impliedCount = row * 2 + col + 1;
    if (impliedCount >= seedsBefore) {
      return true;
    }
    return false;

    // return !animationEnded &&
    //     state.delta &&
    //     state.delta.row === row && state.delta.col === col;
  }

  export function shouldSlowlyAppearStoreCount(side: number): boolean {
    if (!state) {
      return false;
    }
    if (!stateBefore) {
      return false;
    }
    if (!stateBefore.board) {
      return false;
    }
    let seedsBefore = stateBefore.board.boardSides[side].store;
    let seedsNow = state.board.boardSides[side].store;
    return seedsNow !== seedsBefore;
  }

}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_KALAH: "Rules of Kalah",
    RULES_SLIDE1: "Players take turns to sow the seeds anti-clockwise.",
    RULES_SLIDE2: "The one to collect more than 24 seeds in their store wins.",
    CLOSE: "Close"
  });
  game.init();
});
