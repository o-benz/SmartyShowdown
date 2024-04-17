import { HistoricGame } from '@app/model/historic/historic.interface';
import { Room } from '@app/model/socket/socket.schema';
import { HistoricService } from './historic.service';

const LAST = -1;

const mockHistoricGameModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn(),
};

const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('HistoricService', () => {
    let service: HistoricService;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service = new HistoricService(mockHistoricGameModel as any, mockLogger as any); // cool comment
    });

    describe('create', () => {
        it('should successfully create a historic game entry', async () => {
            const historicGame: HistoricGame = {
                gameName: 'Test Game',
                date: '2020-01-01',
                nPlayers: 4,
                bestScore: 100,
            };

            mockHistoricGameModel.create.mockResolvedValue(historicGame);

            const result = await service.create(historicGame);

            expect(mockLogger.log).toHaveBeenCalledWith(`Creating a new historic game entry: ${historicGame.gameName}`);
            expect(mockLogger.log).toHaveBeenCalledWith(`Created new historic game entry: ${historicGame.gameName}`);
            expect(result).toEqual(historicGame);
            expect(mockHistoricGameModel.create).toHaveBeenCalledWith(historicGame);
        });

        it('should handle errors when creating a historic game entry', async () => {
            const error = new Error('Test error');
            mockHistoricGameModel.create.mockRejectedValue(error);

            const incompleteHistoricGame: HistoricGame = {
                gameName: 'Test Game',
                date: '2020-01-01',
                nPlayers: 4,
                bestScore: 0,
            };

            await expect(service.create(incompleteHistoricGame)).rejects.toThrow(error);

            expect(mockLogger.error).toHaveBeenCalledWith('Error creating historic game entry', error);
        });
    });

    describe('Logger Initialization', () => {
        it('should initialize the default logger', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const serviceWithoutMockLogger = new HistoricService(mockHistoricGameModel as any);
            const message = 'buy bitcoin';

            serviceWithoutMockLogger.logMessage(message);
        });
    });

    describe('findAll', () => {
        it('should retrieve all historic game entries sorted by gameName in ascending order by default', async () => {
            const games = [{ gameName: 'Game A' }, { gameName: 'Game B' }];
            mockHistoricGameModel.find.mockReturnThis();
            mockHistoricGameModel.sort.mockReturnThis();
            mockHistoricGameModel.exec.mockResolvedValue(games);

            const results = await service.findAll();

            expect(results).toEqual(games);
        });

        it('should retrieve all historic game entries sorted by gameName in descending order when requested', async () => {
            const games = [{ gameName: 'Game B' }, { gameName: 'Game A' }];
            mockHistoricGameModel.find.mockReturnThis();
            mockHistoricGameModel.sort.mockImplementation((sortCriteria) => {
                if (sortCriteria.gameName === LAST) {
                    return { exec: jest.fn().mockResolvedValue([...games].reverse()) };
                }
                return { exec: jest.fn().mockResolvedValue(games) };
            });

            const results = await service.findAll('gameName', 'desc');

            expect(results).toEqual([...games].reverse());
            expect(mockHistoricGameModel.sort).toHaveBeenCalledWith({ gameName: LAST });
        });
    });

    describe('reset', () => {
        it('should reset all historic game data', async () => {
            await service.reset();

            expect(mockHistoricGameModel.deleteMany).toHaveBeenCalledWith({});
            expect(mockLogger.warn).toHaveBeenCalledWith('Resetting all historic games data');
            expect(mockLogger.warn).toHaveBeenCalledWith('All historic games data have been reset');
        });
    });

    describe('populateHistory', () => {
        it('should populate history based on room data', async () => {
            const room: Room = {
                startingTime: new Date().toISOString(),
                gameStats: {
                    name: 'Game C',
                    users: [
                        {
                            data: {
                                score: 50,
                                answered: false,
                            },
                        },
                        {
                            data: {
                                score: 100,
                                answered: false,
                            },
                        },
                    ],
                    id: '',
                    duration: 0,
                    questions: [],
                },
                roomMessages: [],
                isOpen: false,
                bannedUsers: [],
                isStarted: false,
                isPaused: false,
                delayTick: 0,
                timer: undefined,
                socketTimers: new Map(),
            };

            const expectedGame: HistoricGame = {
                gameName: room.gameStats.name,
                date: expect.any(String),
                nPlayers: room.gameStats.users.length,
                bestScore: 100,
            };

            mockHistoricGameModel.create.mockResolvedValue(expectedGame);

            const result = await service.populateHistory(room as Room);

            expect(result).toEqual(expectedGame);
            expect(mockLogger.log).toHaveBeenCalledWith(`Populated history for room: ${room.gameStats.name}`);
        });
    });
});
