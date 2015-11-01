describe("aiService", function () {
    it("Side 0 finds an immediate winning move", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 24,
                    house: [0, 0, 0, 0, 0, 1],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 22,
                    house: [0, 0, 0, 0, 0, 1],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 0, { maxDepth: 1 });
        var expectedMove = [{ endMatch: { endMatchScores: [1, 0] } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 25,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.LtoR
                            },
                            {
                                store: 22,
                                house: [0, 0, 0, 0, 0, 1],
                                sowDir: SowDirType.RtoL
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 0, house: 5, nitems: 1 } } }];
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Side 1 forces a tie", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 24,
                    house: [0, 0, 1, 0, 0, 0],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 20,
                    house: [1, 2, 0, 0, 0, 0],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 1, { maxDepth: 10 });
        var expectedMove = [{ endMatch: { endMatchScores: [0, 0] } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 24,
                                house: [0, 0, 0, 0, 0, 0],
                                sowDir: SowDirType.LtoR
                            },
                            {
                                store: 22,
                                house: [1, 0, 1, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 1, nitems: 2 } } }];
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Side 1 prevents an immediate win", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 23,
                    house: [0, 0, 0, 2, 0, 0],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 20,
                    house: [1, 1, 1, 0, 0, 0],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 1, { maxDepth: 1 });
        var expectedMove = [{ setTurn: { turnIndex: 0 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 23,
                                house: [0, 0, 0, 2, 0, 0],
                                sowDir: SowDirType.LtoR
                            },
                            {
                                store: 20,
                                house: [0, 2, 1, 0, 0, 0],
                                sowDir: SowDirType.RtoL
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 1, house: 0, nitems: 1 } } }];
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Side 0 prevents an immediate win", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 20,
                    house: [1, 1, 1, 0, 0, 0],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 23,
                    house: [0, 0, 0, 2, 0, 0],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 0, { maxDepth: 1 });
        var expectedMove = [{ setTurn: { turnIndex: 1 } },
            { set: { key: 'board', value: {
                        boardSides: [
                            {
                                store: 20,
                                house: [0, 2, 1, 0, 0, 0],
                                sowDir: SowDirType.LtoR
                            },
                            {
                                store: 23,
                                house: [0, 0, 0, 2, 0, 0],
                                sowDir: SowDirType.RtoL
                            }
                        ]
                    }
                } },
            { set: { key: 'delta', value: { boardSideId: 0, house: 0, nitems: 1 } } }];
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Side 1 finds a win in 2 steps", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 23,
                    house: [2, 0, 0, 1, 0, 0],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 20,
                    house: [1, 0, 0, 0, 1, 0],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 1, { maxDepth: 3 });
        expect(angular.equals(move[2].set.value, { boardSideId: 1, house: 4, nitems: 1 })).toBe(true);
    });
    it("Side 0 finds a win in 2 steps", function () {
        var move = aiService.createComputerMove({
            boardSides: [
                {
                    store: 20,
                    house: [1, 0, 0, 0, 1, 0],
                    sowDir: SowDirType.LtoR
                },
                {
                    store: 23,
                    house: [2, 0, 0, 1, 0, 0],
                    sowDir: SowDirType.RtoL
                }
            ]
        }, 0, { maxDepth: 3 });
        expect(angular.equals(move[2].set.value, { boardSideId: 0, house: 4, nitems: 1 })).toBe(true);
    });
});
