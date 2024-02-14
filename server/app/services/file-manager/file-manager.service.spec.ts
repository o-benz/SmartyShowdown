import { Test, TestingModule } from '@nestjs/testing';
import * as fsPromises from 'node:fs/promises';
import { FileManagerService } from './file-manager.service';

jest.mock('node:fs/promises');

jest.mock('node:fs/promises');
describe('FileManagerService', () => {
    let service: FileManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileManagerService],
        }).compile();

        service = module.get<FileManagerService>(FileManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should read file correctly', async () => {
        const mockContent = 'test content';
        jest.spyOn(fsPromises, 'readFile').mockResolvedValue(mockContent as unknown as Buffer);
        service.path = 'test.json';

        const result = await service.readFile();
        expect(fsPromises.readFile).toHaveBeenCalledWith('test.json', { encoding: 'utf-8' });
        expect(result).toBe(mockContent);
    });

    it('should write file correctly', async () => {
        const mockContent = 'new content';
        jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();
        service.path = 'test.txt';

        await service.writeFile(mockContent);
        expect(fsPromises.writeFile).toHaveBeenCalledWith('test.txt', mockContent);
    });

    it('should write custom file correctly', async () => {
        const mockContent = 'new content';
        const mockPath = 'mock.json';
        jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();

        await service.writeCustomFile(mockPath, mockContent);
        expect(fsPromises.writeFile).toHaveBeenCalledWith(mockPath, mockContent);
    });

    it('should read custom file correctly', async () => {
        const mockContent = 'test content';
        service.path = 'mockfile.json';
        jest.spyOn(fsPromises, 'readFile').mockResolvedValue(mockContent as unknown as Buffer);

        const result = await service.readFile();
        await service.readCustomFile(service.path);
        expect(result).toBe(mockContent);
    });
});
