describe("aiService", function() {

  it("Side 0 finds an immediate winning move", function() {
    var move = aiService.createComputerMove(
      {
        boardSides :
        [
          {//side 0
                    store: 24,
                    house: [0,0,0,0,0,1],
                    sowDir: SowDirType.RtoL
          },
          {//side 1
                    store: 22,
                    house: [0,0,0,0,0,1],
                    sowDir: SowDirType.LtoR
          }
        ]
      }, 0, {maxDepth: 1});
    var expectedMove =
        [{endMatch: {endMatchScores: [1, 0]}},
        {set: {key: 'board', value:
        {
          boardSides :
          [
            {//side 0
                      store: 25,
                      house: [0,0,0,0,0,0],
                      sowDir: SowDirType.RtoL
            },
            {//side 1
                      store: 22,
                      house: [0,0,0,0,0,1],
                      sowDir: SowDirType.LtoR
            }
          ]
        }
        }},
        {set: {key: 'delta', value: { boardSideId: 0, house: 5, nitems: 1}}}];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });


  it("Side 1 forces a tie", function() {
    var move = aiService.createComputerMove(
      {
        boardSides :
        [
          {//side 0
                    store: 24,
                    house: [0,0,1,0,0,0],
                    sowDir: SowDirType.RtoL
          },
          {//side 1
                    store: 20,
                    house: [1,2,0,0,0,0],
                    sowDir: SowDirType.LtoR
          }
        ]
      }, 1, {maxDepth: 2});
    var expectedMove =
        [{endMatch: {endMatchScores: [0, 0]}},
        {set: {key: 'board', value:
        {
          boardSides :
          [
            {//side 0
                      store: 24,
                      house: [0,0,0,0,0,0],
                      sowDir: SowDirType.RtoL
            },
            {//side 1
                      store: 22,
                      house: [1,0,1,0,0,0],
                      sowDir: SowDirType.LtoR
            }
          ]
        }
        }},
        {set: {key: 'delta', value: { boardSideId: 1, house: 1, nitems: 2}}}];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("Side 1 prevents an immediate win", function() {
    var move = aiService.createComputerMove(
      {
        boardSides :
        [
          {//side 0
                    store: 23,
                    house: [0,0,0,2,0,0],
                    sowDir: SowDirType.RtoL
          },
          {//side 1
                    store: 20,
                    house: [1,1,1,0,0,0],
                    sowDir: SowDirType.LtoR
          }
        ]
      }, 1, {maxDepth: 1});
    var expectedMove =
        [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value:
        {
          boardSides :
          [
            {//side 0
                      store: 23,
                      house: [0,0,0,2,0,0],
                      sowDir: SowDirType.RtoL
            },
            {//side 1
                      store: 20,
                      house: [0,2,1,0,0,0],
                      sowDir: SowDirType.LtoR
            }
          ]
        }
        }},
        {set: {key: 'delta', value: { boardSideId: 1, house: 0, nitems: 1}}}];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });


  //
  // it("O prevents an immediate win", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', 'X', ''],
  //        ['O', '', ''],
  //        ['', '', '']], 1, {maxDepth: 2});
  //   expect(angular.equals(move[2].set.value, {row: 0, col: 2})).toBe(true);
  // });
  //
  // it("O prevents another immediate win", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', 'O', ''],
  //        ['X', 'O', ''],
  //        ['', 'X', '']], 1, {maxDepth: 2});
  //   expect(angular.equals(move[2].set.value, {row: 2, col: 0})).toBe(true);
  // });
  //
  // it("X finds a winning move that will lead to winning in 2 steps", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', '', ''],
  //        ['O', 'X', ''],
  //        ['', '', 'O']], 0, {maxDepth: 3});
  //   expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
  // });
  //
  // it("O finds a winning move that will lead to winning in 2 steps", function() {
  //   var move = aiService.createComputerMove(
  //       [['', 'X', ''],
  //        ['X', 'X', 'O'],
  //        ['', 'O', '']], 1, {maxDepth: 3});
  //   expect(angular.equals(move[2].set.value, {row: 2, col: 2})).toBe(true);
  // });
  //
  // it("O finds a cool winning move that will lead to winning in 2 steps", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', 'O', 'X'],
  //        ['X', '', ''],
  //        ['O', '', '']], 1, {maxDepth: 3});
  //   expect(angular.equals(move[2].set.value, {row: 2, col: 1})).toBe(true);
  // });
  //
  // it("O finds the wrong move due to small depth", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', '', ''],
  //        ['', '', ''],
  //        ['', '', '']], 1, {maxDepth: 3});
  //   expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
  // });
  //
  // it("O finds the correct move when depth is big enough", function() {
  //   var move = aiService.createComputerMove(
  //       [['X', '', ''],
  //        ['', '', ''],
  //        ['', '', '']], 1, {maxDepth: 6});
  //   expect(angular.equals(move[2].set.value, {row: 1, col: 1})).toBe(true);
  // });
  //
  // it("X finds a winning move that will lead to winning in 2 steps", function() {
  //   var move = aiService.createComputerMove(
  //       [['', '', ''],
  //        ['O', 'X', ''],
  //        ['', '', '']], 0, {maxDepth: 5});
  //   expect(angular.equals(move[2].set.value, {row: 0, col: 0})).toBe(true);
  // });

});
