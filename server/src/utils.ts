import { Player, PlayStatus, Room } from "./types";

export function rand(limit: number) {
    return Math.floor(Math.random() * limit)
}

export function compare(item: any, value: any): boolean {
    return item?.id === value;
}

export function findIndexByKey(source: Array<any>, value: any, cmp = compare ): number {
    const index = source.findIndex(item => cmp(item, value));

    if (index === -1) {
        // throw new Error('...');
        // console.log('blah blah ...');
    }

    return index;
}

export function findByKey(source: Array<any>, value: any, cmp = compare): any {
    // return source.find(item => compare(item, value));
    return source[findIndexByKey(source, value, cmp)]
}

export function getPlayerIndex(players: Player[], id: string) {
    return players.map(player => player.id).indexOf(id);
}

export function getPlayerBySocket(players: Player[], socketId: string): Player {
    const index = players.map(player => player.socket?.id).indexOf(socketId);
    return players[index];
}

export function getRoom(rooms: Room[], id: string) {
    const index = rooms.map(room => room.id).indexOf(id);
    return rooms[index];
}

export function cutSocket(player: Player): Player {
    const { socket, ...rest } = player;
    return { ...rest };
}

export function cutSockets(room: Room): Room {
    const { players, ...rest } = room;
    if (!players) return room;
    return {
        ...rest,
        players: players.map(player => {
            const { socket, ...rest } = player;
            return { ...rest };
        })
    } as Room;

}

export function cutPlayers(room: Room): Room {
    const { players, ...rest } = room;
    return { ...rest } as Room;
}

export function cutGameStatus(room: Room): Room {
    const { gameStatus, ...rest } = room;
    return { ...rest };
}

export function cutPlayersCards(room: Room): Room {
    const { players, ...rest } = room;

    return {
        ...rest,
        players: players.map(player => {
            const { playerStatus, ...rest } = player;
            if (!playerStatus) return player;

            const { deck, ...restStatus } = playerStatus;
            return { playerStatus: { ...restStatus }, ...rest } as Player;
        })
    }
}

export function cutRoomCards(room: Room): Room {
    const { gameStatus, ...rest } = room;
    if (!gameStatus?.cards) return room;
    const { cards, ...restStatus } = gameStatus;
    return { gameStatus: { ...restStatus }, ...rest };
}

export const cards: number[] = [];
for (let i = 0; i < 52; i++) cards[i] = i;

export function shuffleCards(cards: number[]) {
    const newCards = [...cards];
    for (let i = 0; i < 1000; i++) {
        let location1 = rand(cards.length);
        let location2 = rand(cards.length);
        let tmp = newCards[location1];
        newCards[location1] = newCards[location2];
        newCards[location2] = tmp;
    }
    return newCards;
}

export const nextTurn = (room: Room, turn?: number) => {
    const { gameStatus } = room;
    if (!gameStatus) return 0;
    if (!turn) turn = gameStatus.playTurn;
    let inActivePlayers = 0;
    while (true) {
        turn = (turn + 1) % room.numberOfPlayers;
        const player = room.players[turn];
        const { playerStatus } = player;
        if (!playerStatus) break;
        if (playerStatus.status !== PlayStatus.FOLD && playerStatus.status !== PlayStatus.BUST && playerStatus.status !== PlayStatus.ALLIN) break;
        inActivePlayers++;
        if (inActivePlayers === room.numberOfPlayers) {
            return -1;
        }
    }
    return turn;
}

export const prevTurn = (room: Room, turn?: number) => {
    const { gameStatus } = room;
    if (!gameStatus) return 0;
    if (!turn) turn = gameStatus.playTurn;
    let inActivePlayers = 0;
    while (true) {
        turn = (turn - 1 + room.numberOfPlayers) % room.numberOfPlayers;
        const player = room.players[turn];
        const { playerStatus } = player;
        if (!playerStatus) break;
        if (playerStatus.status !== PlayStatus.FOLD && playerStatus.status !== PlayStatus.BUST && playerStatus.status !== PlayStatus.ALLIN) break;
        inActivePlayers++;
        if (inActivePlayers === room.numberOfPlayers) {
            return -1;
        }
    }
    return turn;
}

export const cardString = (cardval: number) => {
    const suit = ["d", "c", "h", "s"][Math.floor(cardval / 13)];
    cardval %= 13;
    let val = `${cardval + 2}`;
    switch (cardval) {
        case 8: val = 'T'; break;
        case 9: val = 'J'; break;
        case 10: val = 'Q'; break;
        case 11: val = 'K'; break;
        case 12: val = 'A'; break;
    }
    return val + suit;
}