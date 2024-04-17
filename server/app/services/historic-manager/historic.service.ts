import { HistoricGame } from '@app/model/historic/historic.interface';
import { Room, UserSocket } from '@app/model/socket/socket.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const LAST = -1;

@Injectable()
export class HistoricService {
    constructor(
        @InjectModel('HistoricGame', 'games') private historicGameModel: Model<HistoricGame>,
        private readonly logger: Logger = new Logger(HistoricService.name), // not cover
    ) {}

    async create(historicGame: HistoricGame): Promise<HistoricGame> {
        try {
            this.logger.log(`Creating a new historic game entry: ${historicGame.gameName}`);
            const result = await this.historicGameModel.create(historicGame);
            this.logger.log(`Created new historic game entry: ${historicGame.gameName}`);
            return result;
        } catch (error) {
            this.logger.error('Error creating historic game entry', error);
            throw error;
        }
    }

    async findAll(sortBy: string = 'gameName', sortOrder: string = 'asc'): Promise<HistoricGame[]> {
        const order = sortOrder === 'asc' ? 1 : LAST;
        const results = await this.historicGameModel
            .find()
            .sort({ [sortBy]: order })
            .exec();
        return results;
    }

    async reset(): Promise<void> {
        this.logger.warn('Resetting all historic games data');
        await this.historicGameModel.deleteMany({});
        this.logger.warn('All historic games data have been reset');
    }

    async populateHistory(room: Room): Promise<HistoricGame> {
        let bestScore = 0;
        room.gameStats.users.forEach((user: UserSocket) => {
            if (user.data.score && user.data.score > bestScore) {
                bestScore = user.data.score;
            }
        });

        const date = new Date(room.startingTime);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
            .getDate()
            .toString()
            .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

        const gameData: HistoricGame = {
            gameName: room.gameStats.name,
            date: formattedDate,
            nPlayers: room.gameStats.users.length,
            bestScore,
        };

        const result = await this.create(gameData);
        this.logger.log(`Populated history for room: ${room.gameStats.name}`);
        return result;
    }

    logMessage(message: string): void {
        this.logger.log(message);
    }
}
