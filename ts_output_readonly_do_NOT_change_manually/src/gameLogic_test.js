describe("In Kalah", function () {
    function expectMove(turnIndexBeforeMove, stateBeforeMove, move, isOk) {
        expect(gameLogic.isMoveOk({
            turnIndexBeforeMove: turnIndexBeforeMove,
            turnIndexAfterMove: null,
            stateBeforeMove: stateBeforeMove,
            stateAfterMove: null,
            move: move,
            numberOfPlayers: null })).toBe(isOk);
    }
    function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
        expectMove(turnIndexBeforeMove, stateBeforeMove, move, true);
    }
    function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
        expectMove(turnIndexBeforeMove, stateBeforeMove, move, false);
    }
    it("player 0 sowing seeds from house 0 is legal", function () {
        expectMoveOk(0, {}, [{ setTurn: { turnIndex: 1 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 5, 5, 4],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 0,
                                house: [4, 4, 4, 4, 4, 4],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 0, house: 0, nitems: 4 } } }]);
    });
    it("player 1 sowing seeds from house 1 after player 0 sowed from house 0 is legal", function () {
        expectMoveOk(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 5, 5, 4],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 0,
                                house: [4, 0, 5, 5, 5, 5],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 1, nitems: 4 } } }]);
    });
    it("skipping one's store is illegal", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [1, 5, 5, 5, 5, 4],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 0,
                                house: [4, 4, 0, 5, 5, 5],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 2, nitems: 4 } } }]);
    });
    it("skipping opponent's houses is illegal", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 5, 5, 4],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 1,
                                house: [5, 4, 4, 0, 5, 5],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 3, nitems: 4 } } }]);
    });
    it("sowing from opponent's houses is illegal", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 0, 6, 5],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 0,
                                house: [5, 5, 5, 4, 4, 4],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 3, nitems: 4 } } }]);
    });
    it("continuation of turn if last sown is in store is legal", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 1 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 0, 6, 5],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 1,
                                house: [4, 4, 0, 5, 5, 5],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 2, nitems: 4 } } }]);
    });
    it("cannot move after game is over", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 25,
                        house: [0, 0, 0, 0, 0, 0],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 20,
                        house: [0, 0, 0, 0, 2, 1],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 5, nitems: 1 } }, [{ setTurn: { turnIndex: 1 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 25,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 20,
                                house: [0, 0, 0, 0, 2, 0],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 5, nitems: 1 } } }]);
    });
    it("sowing zero seeds is illegal", function () {
        expectIllegalMove(1, { board: {
                boardSides: [
                    {
                        store: 0,
                        house: [0, 5, 5, 5, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 0,
                        house: [4, 4, 4, 4, 4, 4],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 0, nitems: 4 } }, [{ setTurn: { turnIndex: 1 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 0,
                                house: [0, 5, 5, 5, 5, 4],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 0,
                                house: [4, 4, 4, 4, 4, 4],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 2, nitems: 0 } } }]);
    });
    it("when the last sown seed is an own-empty house, then capture opposite side house seeds plus own last into store, is legal", function () {
        expectMoveOk(1, { board: {
                boardSides: [
                    {
                        store: 7,
                        house: [2, 2, 5, 0, 5, 4],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 6,
                        house: [0, 0, 0, 5, 4, 8],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 3, nitems: 2 } }, [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 7,
                                house: [3, 3, 6, 1, 6, 0],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 13,
                                house: [0, 0, 0, 5, 4, 0],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 5, nitems: 8 } } }]);
    });
    it("Side 0 wins by capturing more than 24 seeds and cleaning up his houses, is legal", function () {
        expectMoveOk(0, { board: {
                boardSides: [
                    {
                        store: 24,
                        house: [0, 0, 0, 0, 0, 1],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 22,
                        house: [0, 0, 0, 0, 0, 1],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 1, house: 4, nitems: 1 } }, [{ endMatch: { endMatchScores: [1, 0] } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 25,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 22,
                                house: [0, 0, 0, 0, 0, 1],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 0, house: 5, nitems: 1 } } }]);
    });
    it("Side 1 wins by capturing more than 24 seeds and cleaning up his houses, is legal", function () {
        expectMoveOk(1, { board: {
                boardSides: [
                    {
                        store: 23,
                        house: [0, 0, 1, 0, 0, 0],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 23,
                        house: [0, 0, 1, 0, 0, 0],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 0, house: 1, nitems: 1 } }, [{ endMatch: { endMatchScores: [0, 1] } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 23,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 25,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 2, nitems: 1 } } }]);
    });
    it("game ties when each side has 24 seeds, is legal", function () {
        expectMoveOk(0, { board: {
                boardSides: [
                    {
                        store: 23,
                        house: [0, 0, 0, 0, 0, 1],
                        sowDir: SowDirType.RtoL
                    },
                    {
                        store: 18,
                        house: [0, 1, 2, 3, 0, 0],
                        sowDir: SowDirType.LtoR
                    }
                ]
            }, delta: { boardSideId: 1, house: 0, nitems: 1 } }, [{ endMatch: { endMatchScores: [0, 0] } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 24,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            },
                            {
                                store: 18,
                                house: [0, 1, 2, 3, 0, 0],
                                sowDir: SowDirType.LtoR
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 0, house: 5, nitems: 1 } } }]);
    });
    //
    // it("the game ties when there are no more empty cells", function() {
    //   expectMoveOk(0,
    //     {board:
    //       [['X', 'O', 'X'],
    //        ['X', 'O', 'O'],
    //        ['O', 'X', '']], delta: {row: 2, col: 0}},
    //     [{endMatch: {endMatchScores: [0, 0]}},
    //           {set: {key: 'board', value:
    //             [['X', 'O', 'X'],
    //              ['X', 'O', 'O'],
    //              ['O', 'X', 'X']]}},
    //           {set: {key: 'delta', value: {row: 2, col: 2}}}]);
    // });
    //
    // it("null move is illegal", function() {
    //   expectIllegalMove(0, {}, null);
    // });
    //
    // it("move without board is illegal", function() {
    //   expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}}]);
    // });
    //
    // it("move without delta is illegal", function() {
    //   expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
    //     {set: {key: 'board', value:
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']]}}]);
    // });
    //
    // it("placing X outside the board (in 3x0) is illegal", function() {
    //   expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
    //     {set: {key: 'board', value:
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']]}},
    //     {set: {key: 'delta', value: {row: 3, col: 0}}}]);
    // });
    //
    // it("placing X in 0x0 but setTurn to yourself is illegal", function() {
    //   expectIllegalMove(0, {}, [{setTurn: {turnIndex : 0}},
    //     {set: {key: 'board', value:
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']]}},
    //     {set: {key: 'delta', value: {row: 0, col: 0}}}]);
    // });
    //
    // it("placing X in 0x0 but setting the board wrong is illegal", function() {
    //   expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
    //     {set: {key: 'board', value:
    //       [['X', 'X', ''],
    //        ['', '', ''],
    //        ['', '', '']]}},
    //     {set: {key: 'delta', value: {row: 0, col: 0}}}]);
    // });
    //
    // it("getPossibleMoves returns exactly one cell", function() {
    //   var board =
    //       [['O', 'O', 'X'],
    //        ['X', 'X', 'O'],
    //        ['O', 'X', '']];
    //   var possibleMoves = gameLogic.getPossibleMoves(board, 0);
    //   var expectedMove = [{endMatch: {endMatchScores: [0, 0]}},
    //       {set: {key: 'board', value:
    //         [['O', 'O', 'X'],
    //          ['X', 'X', 'O'],
    //          ['O', 'X', 'X']]}},
    //       {set: {key: 'delta', value: {row: 2, col: 2}}}];
    //   expect(angular.equals(possibleMoves, [expectedMove])).toBe(true);
    // });
});
