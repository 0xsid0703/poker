import { Socket } from "socket.io";
import { GameStatus, Player, PlayerStatus, PlayStatus, Room } from "./types";
import { v4 as uuidV4 } from "uuid";
import { PLAYER_WAIT_TIME, ROUND_WAIT_TIME } from "./constants";
import {
  cards,
  cardString,
  cutGameStatus,
  cutPlayers,
  cutPlayersCards,
  cutRoomCards,
  cutSocket,
  cutSockets,
  getPlayerBySocket,
  getPlayerIndex,
  getRoom,
  nextTurn,
  prevTurn,
  rand,
  shuffleCards,
  findIndexByKey,
} from "./utils";

const Hand = require("pokersolver").Hand;

export default class PokerGame {
    private players: Player[];
    private rooms: Room[];
    constructor() {
        this.players = [];
        this.rooms = [];
    }

    public joinGame(socket: Socket, { name }: { name: string }): void {
        try {
            const playerId = uuidV4();
            const player: Player = { id: playerId, name, balance: 2000, socket };
            this.players.push(player);

            socket.emit("joinedGame", {
                player: cutSocket(player),
                rooms: this.rooms.map(room => cutPlayers(room))
            });
        } catch (error) {
            console.log(error);
        }
    }

    public leaveGame(socket: Socket): void {
        try {
            this.leaveRoom(socket);
            const player = getPlayerBySocket(this.players, socket.id);
            if (!player) return;
            this.rooms.forEach((room) => {
                if (room.creator.id === player.id) {
                    this.closeRoom({ roomId: room.id });
                }
            })
            this.players = this.players.filter(player => player.socket && player.socket.id !== socket.id);
        } catch (error) {
            console.log(error);
        }
    }

    public createRoom(socket: Socket, { name }: { name: string }): void {
        try {
            const roomId = uuidV4();
            const player = getPlayerBySocket(this.players, socket.id);
            if (!player) return;

            const room: Room = {
                id: roomId,
                name,
                creator: cutSocket(player),
                started: false,
                numberOfPlayers: 1,
                players: [player]
            };
            this.rooms.push(room);

            this.players.forEach((player: Player) => {
                player.socket && player.socket.emit("createdRoom", { room: player.socket.id === socket.id ? cutSockets(room) : cutPlayers(room) });
            });
        } catch (error) {
            console.log(error);
        }
    }

    public joinRoom(socket: Socket, { roomId }: { roomId: string }): void {
        try {
            const newPlayer = getPlayerBySocket(this.players, socket.id);
            if (!newPlayer) return;
            const room = getRoom(this.rooms, roomId);
            if (!room) return;
            if (room.numberOfPlayers >= 10) {
                return;
            }
            if (findIndexByKey(room.players, newPlayer.id) !== -1) {
                return;
            }

            newPlayer.roomId = roomId;
            room.numberOfPlayers++;
            room.players.push(newPlayer);

            this.players.forEach((player) => {
                if (getPlayerIndex(room.players, player.id) === -1) {
                    player.socket?.emit("updatedRoom", { room: cutPlayers(room) });
                } else {
                    player.socket?.emit("joinedPlayer", { room: cutSockets(room) });
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    public leaveRoom(socket: Socket): void {
        try {
            const leftPlayer = getPlayerBySocket(this.players, socket.id);
            if (!leftPlayer || !leftPlayer.roomId) return;
            const room = getRoom(this.rooms, leftPlayer.roomId);
            if (!room) return;

            room.numberOfPlayers--;
            room.players = room.players.filter(player => player.id !== leftPlayer.id);

            this.players.forEach((player) => {
                if (getPlayerIndex(room.players, player.id) === -1) {
                    player.socket?.emit("updatedRoom", { room: cutPlayers(room) });
                } else {
                    player.socket?.emit("leftPlayer", { room: cutSockets(room) });
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    public closeRoom({ roomId }: { roomId: string }): void {
        try {
            this.rooms = this.rooms.filter(room => room.id !== roomId);
            this.players.forEach((player) => {
                player.socket?.emit("closedRoom", { roomId });
            })
        } catch (error) {
            console.log(error);
        }
    }

    public startRoomGame({ roomId }: { roomId: string }): void {
        try {
            const room = getRoom(this.rooms, roomId);
            if (!room) return;
            room.started = true;
            this.startNewRound(room);

            this.players.forEach((player) => {
                const playerIndex = getPlayerIndex(room.players, player.id);
                if (playerIndex === -1) {
                    player.socket?.emit("updatedRoom", { room: cutPlayers(cutGameStatus(room)) });
                } else {
                    player.socket?.emit("updatedGameStatus", { room: cutPlayersCards(cutRoomCards(cutSockets(room))), player: cutSocket(room.players[playerIndex]) });
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    finishGame = (room: Room) => {
        if (!room.gameStatus) return;
        room.gameStatus.gameFinished = true;
    }

    startNewRound = (room: Room) => {
        const shuffledCards = shuffleCards(cards);

        let activePlayers = 0;
        room.players.forEach((player) => {
            if (!player || !player.playerStatus) return;
            player.playerStatus.status = player.balance === 0 ? PlayStatus.BUST : PlayStatus.NONE;
            if (player.balance > 0) activePlayers++;
        });


        let blindTurn = rand(room.numberOfPlayers);
        if (room.gameStatus) {
            if (room.gameStatus.round > 0 && activePlayers < 2) {
                this.finishGame(room);
                return;
            }
            blindTurn = nextTurn(room, room.gameStatus.blindTurn);
            if (blindTurn === -1) {
                this.finishGame(room);
                return;
            }
        }
        const gameStatus: GameStatus = {
            round: 1,
            roundFinished: false,
            gameFinished: false,
            currentBetAmount: 0,
            smallBlindAmount: 5,
            bigBlindAmount: 10,
            minRaiseAmount: 10,
            pot: 0,
            blindTurn,
            playTurn: blindTurn,
            deck: [],
            cards: shuffledCards,
            timestamp: 0,
            logs: [],
        };

        if (room.gameStatus) {
            gameStatus.round = room.gameStatus.round + 1;
        }

        room.gameStatus = gameStatus;

        room.players.forEach((player, index) => {
            const playerStatus: PlayerStatus = {
                totalBetAmout: 0,
                subTotalBetAmount: 0,
                raised: false,
                status: PlayStatus.NONE,
                deck: [
                    shuffledCards[index * 2],
                    shuffledCards[index * 2 + 1]
                ],
                winAmount: 0,
            };
            player.playerStatus = playerStatus;
        })

        room.players.forEach((player, index) => {
            const { playerStatus } = player;
            if (playerStatus && (index === blindTurn || index === prevTurn(room, blindTurn))) {
                let amount = index === blindTurn ? gameStatus.bigBlindAmount : gameStatus.smallBlindAmount;
                if (gameStatus.currentBetAmount < amount) gameStatus.currentBetAmount = amount;
                if (player.balance >= amount) {
                    playerStatus.subTotalBetAmount = amount;
                    player.balance -= amount;
                    gameStatus.pot += amount;
                } else {
                    playerStatus.status = PlayStatus.BUST;
                }
            }
        });
        gameStatus.playTurn = nextTurn(room, blindTurn);
        gameStatus.timestamp = new Date().getTime();

        setTimeout(() => {
            const { gameStatus } = room;
            if (gameStatus && new Date().getTime() - gameStatus.timestamp >= PLAYER_WAIT_TIME) {
                const player = room.players[gameStatus.playTurn];
                if (!player) return;
                const { playerStatus, socket } = player;
                if (!playerStatus || !socket) return;
                this.updateGameStatus(socket, { roomId: room.id, status: PlayStatus.FOLD });
            }
        }, PLAYER_WAIT_TIME);
    }

    checkWinning = (room: Room) => {
        // check winners
        const hands: any[] = [];
        const { gameStatus } = room;
        if (!gameStatus) return;
        room.players.forEach(player => {
            const { playerStatus } = player;
            if (playerStatus && playerStatus.status !== PlayStatus.BUST && playerStatus.status !== PlayStatus.FOLD) {
                const deck = [...playerStatus?.deck, ...gameStatus.deck];
                hands.push(Hand.solve(deck.map(cardval => cardString(cardval))));
            } else {
                hands.push(null);
            }
        });
        console.log(hands.length);
        let subHands = hands.filter(hand => hand);
        while (gameStatus.pot) {
            if (!subHands.length) break;
            const winners = Hand.winners(subHands);
            subHands = subHands.filter(hand => !winners.includes(hand));
            winners.forEach((winner: any, index: number) => {
                const playerIndex = hands.indexOf(winner);
                const player = room.players[playerIndex];
                const { playerStatus } = player;
                if (playerStatus) {
                    const totalBetAmout = playerStatus.totalBetAmout;
                    let maxWinAmount = totalBetAmout;
                    const remainingIndexes = subHands.map(hand => hands.indexOf(hand));
                    console.log(remainingIndexes);
                    room.players.forEach((player, index) => {
                        const { playerStatus } = player;
                        if (playerStatus && (remainingIndexes.includes(index) || playerStatus.status === PlayStatus.BUST || playerStatus.status === PlayStatus.FOLD)) {
                            maxWinAmount += Math.min(totalBetAmout, playerStatus.totalBetAmout);
                        }
                    });
                    const winAmount = Math.min(maxWinAmount, Math.floor(gameStatus.pot / (winners.length - index)));
                    console.log(gameStatus.pot, winners.length - index, maxWinAmount);
                    playerStatus.winAmount += winAmount;
                    gameStatus.pot -= winAmount;
                    player.balance += winAmount;
                    playerStatus.handType = winner.name;
                }
            });
        }

        gameStatus.roundFinished = true;

        room.players.forEach((player) => {
            player.socket?.emit("updatedGameStatus", { room: cutSockets(room), player: cutSocket(player) });
        });


        // start new round after 10 seconds
        setTimeout(() => {
            this.startNewRound(room);
            if (!room.players || room.gameStatus?.gameFinished) return;
            room.players.forEach((player) => {
                player.socket?.emit("updatedGameStatus", { room: cutPlayersCards(cutRoomCards(cutSockets(room))), player: cutSocket(player) });
            });
        }, ROUND_WAIT_TIME);
    }

    dealCards = (room: Room) => {
        const { gameStatus } = room;
        if (!gameStatus || !gameStatus.cards) return false;

        room.players.forEach(player => {
            const { playerStatus } = player;
            if (playerStatus) {
                playerStatus.totalBetAmout += playerStatus.subTotalBetAmount;
                playerStatus.subTotalBetAmount = 0;
            }
            gameStatus.currentBetAmount = 0;
        })

        gameStatus.playTurn = nextTurn(room, gameStatus.blindTurn);

        if (gameStatus.deck.length === 5) {
            this.checkWinning(room);
            return true;
        }
        if (!gameStatus.deck.length) {
            for (let i = 0; i < 3; i++) {
                gameStatus.deck[i] = gameStatus.cards[51 - i];
            }
        } else {
            gameStatus.deck.push(gameStatus.cards[51 - gameStatus.deck.length]);
        }
        return false;
    }

    public updateGameStatus(socket: Socket, { roomId, status, amount }: { roomId: string, status: PlayStatus, amount?: number }): void {
        try {
            let player = getPlayerBySocket(this.players, socket.id);
            if (!player) return;
            const room = getRoom(this.rooms, roomId);
            if (!room) return;
            const { gameStatus } = room;
            if (!gameStatus) return;

            const playerIndex = findIndexByKey(room.players, player.id);
            if (playerIndex === -1 || playerIndex !== gameStatus.playTurn || !gameStatus.cards) {
                return;
            }

            player = room.players[playerIndex];
            const { playerStatus } = player;
            if (!playerStatus) return;

            let log = player.name + ": ";

            playerStatus.status = status;

            let dealCardsFlag = false;
            if (status === PlayStatus.CALL) {
                let betAmount = gameStatus.currentBetAmount - playerStatus.subTotalBetAmount;
                if (player.balance < betAmount) {
                    betAmount = player.balance;
                    playerStatus.status = PlayStatus.ALLIN;
                }
                player.balance -= betAmount;
                playerStatus.subTotalBetAmount += betAmount;
                gameStatus.pot += betAmount;

                gameStatus.playTurn = nextTurn(room);
                // let nextPlayer = room.players[gameStatus.playTurn];
                // if (nextPlayer.playerStatus?.raised && nextPlayer.playerStatus?.subTotalBetAmount === gameStatus.currentBetAmount) {
                //     dealCardsFlag = this.dealCards(room);
                // }

                let activePlayers = 0;
                room.players.forEach((player) => {
                    const { playerStatus } = player;
                    if (playerStatus &&
                        playerStatus.status !== PlayStatus.FOLD &&
                        playerStatus.status !== PlayStatus.BUST &&
                        playerStatus.status !== PlayStatus.ALLIN
                    ) {
                        activePlayers++;
                    }
                });

                if (activePlayers === 1) {
                    while (!this.dealCards(room));
                    dealCardsFlag = true;
                }
                
                log += "Call";
            } else if (status === PlayStatus.RAISE && amount) {
                let betAmount = gameStatus.currentBetAmount + amount - playerStatus.subTotalBetAmount;
                if (player.balance < betAmount) {
                    return;
                }
                if (gameStatus.minRaiseAmount <= amount) {
                    gameStatus.minRaiseAmount = amount;
                } else {
                    return;
                }
                player.balance -= betAmount;
                gameStatus.currentBetAmount += amount;
                playerStatus.subTotalBetAmount += betAmount
                playerStatus.raised = true;
                gameStatus.pot += betAmount;

                gameStatus.playTurn = nextTurn(room);

                log += ("Raise " + amount);
            } else if (status === PlayStatus.CHECK) {
                if (nextTurn(room) === nextTurn(room, gameStatus.blindTurn)) {
                    dealCardsFlag = this.dealCards(room);
                } else {
                    gameStatus.playTurn = nextTurn(room);
                }
                log += "Check";
            } else if (status === PlayStatus.FOLD) {
                playerStatus.status = PlayStatus.FOLD;
                gameStatus.playTurn = nextTurn(room);
                if (gameStatus.playTurn === -1) {
                    while (!this.dealCards(room));
                    return;
                }

                let nextPlayer = room.players[gameStatus.playTurn];
                if (nextPlayer.playerStatus?.subTotalBetAmount === gameStatus.currentBetAmount) {
                    dealCardsFlag = this.dealCards(room);
                }

                let activePlayers = 0;
                room.players.forEach((player) => {
                    const { playerStatus } = player;
                    if (playerStatus &&
                        playerStatus.status !== PlayStatus.FOLD &&
                        playerStatus.status !== PlayStatus.BUST &&
                        playerStatus.status !== PlayStatus.ALLIN
                    ) {
                        activePlayers++;
                    }
                });

                if (activePlayers === 1) {
                    while (!this.dealCards(room));
                    dealCardsFlag = true;
                }
                log += "Check";
            } else if (status === PlayStatus.ALLIN) {
                playerStatus.status = PlayStatus.ALLIN;
                playerStatus.subTotalBetAmount += player.balance;
                if (gameStatus.currentBetAmount < playerStatus.subTotalBetAmount) {
                    gameStatus.currentBetAmount = playerStatus.subTotalBetAmount;
                    const raiseAmount = playerStatus.subTotalBetAmount - gameStatus.currentBetAmount;
                    if (gameStatus.minRaiseAmount < raiseAmount) {
                        gameStatus.minRaiseAmount = raiseAmount;
                    }
                }
                gameStatus.pot += player.balance;
                player.balance = 0;
                gameStatus.playTurn = nextTurn(room);

                if (gameStatus.playTurn === -1) {
                    while (!this.dealCards(room));
                    dealCardsFlag = true;
                }

                log += "All In";
            }

            gameStatus.timestamp = new Date().getTime();

            if (dealCardsFlag) return;

            gameStatus.logs.push(log);

            room.players.forEach((player) => {
                player.socket?.emit("updatedGameStatus", { room: cutPlayersCards(cutRoomCards(cutSockets(room))), player: cutSocket(player) });
            });


            setTimeout(() => {
                const { gameStatus } = room;
                if (gameStatus && new Date().getTime() - gameStatus.timestamp >= PLAYER_WAIT_TIME) {
                    const player = room.players[gameStatus.playTurn];
                    if (!player) return;
                    const { playerStatus, socket } = player;
                    if (!playerStatus || !socket) return;
                    if (playerStatus.subTotalBetAmount === gameStatus.currentBetAmount) {
                        this.updateGameStatus(socket, { roomId: room.id, status: PlayStatus.CHECK });
                    } else {
                        this.updateGameStatus(socket, { roomId: room.id, status: PlayStatus.FOLD });
                    }
                }
            }, PLAYER_WAIT_TIME);
        } catch (error) {
            console.log(error);
        }
    }

    public test() {
        const players: Player[] = [];
        const shuffledCards = shuffleCards(cards);
        const betAmounts = [20, 80, 50, 40];
        const folds = [false, false, true, false];
        let pot = 0;
        for (let i = 0; i < 4; i++) {
            pot += betAmounts[i];
            players.push({
                id: uuidV4(),
                name: `player ${i}`,
                balance: 1000,
                playerStatus: {
                    totalBetAmout: betAmounts[i],
                    subTotalBetAmount: 0,
                    raised: false,
                    status: folds[i] ? PlayStatus.FOLD : PlayStatus.CALL,
                    deck: shuffledCards.slice(i * 2, i * 2 + 2),
                    winAmount: 0,
                }
            })
        };

        const room: Room = {
            id: uuidV4(),
            name: 'test',
            creator: players[0],
            started: true,
            numberOfPlayers: 4,
            players,
            gameStatus: {
                round: 0,
                roundFinished: false,
                gameFinished: false,
                currentBetAmount: 30,
                smallBlindAmount: 5,
                bigBlindAmount: 10,
                minRaiseAmount: 10,
                pot,
                blindTurn: 0,
                playTurn: 0,
                deck: shuffledCards.slice(-5),
                timestamp: 0,
                logs: [],
            }
        }


        console.log(room.gameStatus);
        this.checkWinning(room);
        console.log(room.gameStatus);

        for (let i = 0; i < 4; i++) {
            console.log(players[i]);
        }
    }
}

// const hand1 = Hand.solve([
//     '5s', '7c',
//     '6d', '2d',
//     '8c', '3h',
//     '2s'
//   ]);
// const hand2 = Hand.solve([
//     'Qc', '7s',
//     '6d', '2d',
//     '8c', '3h',
//     '2s'
//   ]);
// const hand3 = Hand.solve([
//     '4s', 'Qh',
//     '6d', '2d',
//     '8c', '3h',
//     '2s'
//   ]);
// const hands = [hand1, hand2, hand3];
// const winners = Hand.winners(hands);

// console.log(winners.map((winner: { name: any; }) => winner.name + " " + hands.indexOf(winner)));