import { GameEnum } from '@app/gateways/game/game.gateway.events';
import { Room, UserSocket } from '@app/model/socket/socket.schema';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketService {
    isUserValid(username: string, users: UserSocket[]): boolean {
        const isNotEmpty = username !== undefined && username.trim().length > 0;
        return isNotEmpty && this.isNotOrganizer(username) && this.isUniqueUsername(username, users);
    }

    isUniqueUsername(username: string, users: UserSocket[]): boolean {
        return (
            users.find((user) => {
                if (user.data.username) return user.data.username.toLowerCase() === username.toLowerCase();
            }) === undefined
        );
    }

    isNotOrganizer(username: string): boolean {
        return username.toLowerCase() !== GameEnum.Organizer;
    }

    async getSocketsInRoom(room: string, server: Server): Promise<UserSocket[]> {
        return await server.in(room).fetchSockets();
    }

    async getAllUsernamesInRoom(room: string, server: Server): Promise<string[]> {
        const sockets = await this.getSocketsInRoom(room, server);
        return Array.from(sockets).map((socket) => socket.data.username);
    }

    async getAllMessages(room: Room): Promise<string[]> {
        return room.roomMessages;
    }

    addMessageToRoom(room: Room, message: string): void {
        room.roomMessages.push(message);
    }

    isLoginValid(rooms: Map<string, Room>, socket: Socket, username: string): boolean {
        return (
            rooms.has(socket.data.room) && rooms.get(socket.data.room) && !rooms.get(socket.data.room).bannedUsers.includes(username.toLowerCase())
        );
    }
}
