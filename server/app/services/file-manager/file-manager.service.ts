import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'node:fs/promises';

@Injectable()
export class FileManagerService {
    path = '';

    async readFile() {
        return readFile(this.path, { encoding: 'utf-8' });
    }

    async readCustomFile(customPath: string) {
        return readFile(customPath, { encoding: 'utf-8' });
    }

    async writeCustomFile(customPath: string, content) {
        return writeFile(customPath, content);
    }

    async writeFile(content) {
        await writeFile(this.path, content);
    }
}
