const MAXSEEDS = 48;
const NUM_HOUSES = 6;

enum SowDirType {
  RtoL,
  LtoR
}

interface LocationSown {
    sowDir:SowDirType;
    houseNum?: number;
    store?:boolean;
}

interface BoardSide {
  store: number;
  house: number[];
  sowDir: SowDirType;
}

interface Board {
  boardSides: BoardSide[];
}

interface BoardDelta {
  boardSideId: number;
  house: number;
  nitems: number
}

interface IState {
  board?: Board;
  delta?: BoardDelta;
}

module gameLogic {

  /** Returns the initial Kalah board, each side has each of their
   * houses filled with 4 seeds
   */

  export function getInitialBoard(): Board {
    var side0:BoardSide = {//side 0, player 0, the far side (the upper side in UI)
              store: 0,
              house: [4,4,4,4,4,4],
              sowDir: SowDirType.RtoL
    };
    var side1:BoardSide = {//side 1, player 1, the far side (the upper side in UI)
              store: 0,
              house: [4,4,4,4,4,4],
              sowDir: SowDirType.LtoR
    };
    var initialBoard : Board = {
        boardSides : [side0, side1]
    };
    return initialBoard;

  }

  /** sum of houses === 0 ? */
  function IsSideEmpty(side : BoardSide) : boolean {
    return (side.house.reduce(function(p, c){
      return p+c;
    })  === 0);
  }

  /**
  * houses + store for the side
  */
  function houseAndStoreTotal(side: BoardSide) : number {
    return (side.house.reduce(function(p,c){
        return p+c;
    }) + side.store);
  }


  /**
   * Returns true if the game ended in a tie
   * Either side is empty and the house and store total === MAXSEEDS/2
   */
  function isTie(board: Board): boolean {
    if (IsSideEmpty(board.boardSides[0]) ||
        IsSideEmpty(board.boardSides[1])) {
          return (houseAndStoreTotal(board.boardSides[0]) ===
                  Math.floor(MAXSEEDS/2));

    }
    return false;
  }

  /**
   * Return the winning side
   */
  function getWinner(board: Board): BoardSide {
    if (IsSideEmpty(board.boardSides[0]) ||
        IsSideEmpty(board.boardSides[1])) {
          return (
            houseAndStoreTotal(board.boardSides[0]) > Math.floor(MAXSEEDS/2)
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
  export function createMove(
      board: Board, bd: BoardDelta, turnIndexBeforeMove: number): IMove {
      if (!board) {
        // Initially (at the beginning of the match), the board in state is undefined.
        board = getInitialBoard();
      }
      if (isTie(board) || getWinner(board) !== null ) {
        throw new Error("Can only make a move if the game is not over!");
      }
      // if (bd.boardSideId !== turnIndexBeforeMove) {
      //   throw new Error("Playing out of turn?");
      // }
      if (bd.nitems === 0) {
        throw new Error("Sowing zero seeds?");
      }
      //save a few vars
      var wkdelta: BoardDelta = angular.copy(bd);
      var boardAfterMove = angular.copy(board);
      var svTurnIndexBeforeMove :number = turnIndexBeforeMove;
      var svNItems : number = wkdelta.nitems;
      var svSowDir : SowDirType = board.boardSides[turnIndexBeforeMove].sowDir;


      //zero out the house from which seeds will be taken to be sown
      boardAfterMove.boardSides[turnIndexBeforeMove].house[wkdelta.house] = 0;
      var lastVisitedLocn : LocationSown = {sowDir: undefined,
                      houseNum: undefined, store: false};
      var startHouse : number = wkdelta.house + 1;
      while (wkdelta.nitems > 0) {
          if (boardAfterMove.boardSides[turnIndexBeforeMove].sowDir ===
                SowDirType.RtoL) {//side 0 RtoL
              lastVisitedLocn.sowDir = SowDirType.RtoL;
          } else {
              lastVisitedLocn.sowDir = SowDirType.LtoR;
          }
          for (var i : number = startHouse; i < NUM_HOUSES; i++) {
            boardAfterMove.boardSides[turnIndexBeforeMove].house[i]++;
            wkdelta.nitems--;
            lastVisitedLocn.houseNum = i;
            lastVisitedLocn.store = false;
            if (wkdelta.nitems === 0) {
              break;
            }
          }
          if ( (wkdelta.nitems > 0) && (svTurnIndexBeforeMove === turnIndexBeforeMove) ){// add to store
            boardAfterMove.boardSides[turnIndexBeforeMove].store++;
            lastVisitedLocn.houseNum = NUM_HOUSES;//invalid house num
            lastVisitedLocn.store = true;
            wkdelta.nitems--;
          }
          turnIndexBeforeMove = 1 - turnIndexBeforeMove;//sow on the other side now
          startHouse = 0;
      }//while

      //if last location was one's own house and was empty,
      //then capture all of the seeds from the opponent's house and one's own house
      // into one's store.
      if(
        !lastVisitedLocn.store
        && (lastVisitedLocn.sowDir === svSowDir)
        && (boardAfterMove.boardSides[svTurnIndexBeforeMove].house[lastVisitedLocn.houseNum] === 1)
        ) {

          //Do this ONLY if the opponent's house is non-empty - Oct 29, 2015
            if (boardAfterMove.boardSides[1 - svTurnIndexBeforeMove]
              .house[NUM_HOUSES - 1 - lastVisitedLocn.houseNum] > 0)
            {
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
      var firstOperation: IOperation;
      if (isTie(boardAfterMove) ) {
        //Game over
        firstOperation = {endMatch: {endMatchScores: [0, 0]}};
      } else if ( winner !== null) {
        // Game over
        firstOperation = {endMatch: {endMatchScores:
          winner.sowDir === SowDirType.LtoR ? [0, 1] : [1, 0]}};
      } else {
        //check for move continuation - if you end in your own store
        if (lastVisitedLocn.store) {
          firstOperation = {setTurn: {turnIndex: svTurnIndexBeforeMove}};
        } else {
          // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
          firstOperation = {setTurn: {turnIndex: 1 - svTurnIndexBeforeMove}};
        }
      }

      var delta: BoardDelta = angular.copy(bd);
      return [firstOperation,
              {set: {key: 'board', value: boardAfterMove}},
              {set: {key: 'delta', value: delta}}];
  }


  export function isMoveOk(params: IIsMoveOk): boolean {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
      var deltaValue: BoardDelta = move[2].set.value;
      var passDeltaValue:BoardDelta = angular.copy(deltaValue);
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
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }
}
