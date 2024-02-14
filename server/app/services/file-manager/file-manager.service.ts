import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'node:fs/promises';

@Injectable()
export class FileManagerService {
    path = '';

    async readFile() {
        return await readFile(this.path, { encoding: 'utf-8' });
    }

    async readCustomFile(customPath: string) {
        return await readFile(customPath, { encoding: 'utf-8' });
    }

    async writeCustomFile(customPath: string, content) {
        return await writeFile(customPath, content);
    }

    async writeFile(content) {
        await writeFile(this.path, content);
    }
}
