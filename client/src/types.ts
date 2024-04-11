export type PlayerStatus = {
    totalBetAmout: number;
    subTotalBetAmount: number;
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
    currentBetAmount: number;
    pot: number;
    blindTurn: number;
    playTurn: number;
    deck: number[];
    cards?: number[];
    timestamp: number;
}