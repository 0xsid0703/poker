import { Socket } from "socket.io";

export type PlayerStatus = {
    totalBetAmout: number;
    subTotalBetAmount: number;
    raised: boolean;
    status: PlayStatus;
    deck: number[];
    winAmount: number;
    handType?: string;
}

export enum PlayStatus {
    NONE,
    BUST,
    FOLD,
    CALL,
    RAISE,
    CHECK,
    ALLIN,
}

export type Player = {
    id: string;
    name: string;
    balance: number;
    socket?: Socket;
    roomId?: string;
    playerStatus?: PlayerStatus;
};

export type Room = {
    id: string;
    name: string;
    creator: Player;
    started: boolean;
    numberOfPlayers: number;
    players: Player[];
    gameStatus?: GameStatus;
};

export type GameStatus = {
    round: number,
    roundFinished: boolean,
    gameFinished: boolean,
    currentBetAmount: number;
    smallBlindAmount: number;
    bigBlindAmount: number;
    minRaiseAmount: number;
    pot: number;
    blindTurn: number;
    playTurn: number;
    deck: number[];
    cards?: number[];
    timestamp: number;
    logs: string[];
}