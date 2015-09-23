const MAXSEEDS = 48;
enum SowDirType {
  RtoL,
  LtoR
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
  boardSide: number;
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
    var initialBoard : Board;
    initialBoard.boardSides.push({
              store: 0,
              house: [4,4,4,4,4,4],
              sowDir: SowDirType.RtoL
        });
    initialBoard.boardSides.push({
              store: 0,
              house: [4,4,4,4,4,4],
              sowDir: SowDirType.LtoR
        });
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
    return (
      houseAndStoreTotal(board.boardSides[0]) > Math.floor(MAXSEEDS/2))
      ? board.boardSides[0] : board.boardSides[1]);
  }

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): IMove[] {
    var possibleMoves: IMove[] = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        try {
          possibleMoves.push(createMove(board, i, j, turnIndexBeforeMove));
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      board: Board, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    var boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    var winner = getWinner(boardAfterMove);
    var firstOperation: IOperation;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0]}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    var delta: BoardDelta = {row: row, col: col};
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: delta}}];
  }

  export function isMoveOk(params: IIsMoveOk): boolean {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;
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
      var deltaValue: BoardDelta = move[2].set.value;
      var row = deltaValue.row;
      var col = deltaValue.col;
      var board = stateBeforeMove.board;
      var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
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
