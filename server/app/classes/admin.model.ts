// https://bcrypt.online/
import { adminConst } from '@app/authGard/constants';
import * as bcrypt from 'bcrypt';

export class Admin {
    private static instance: Admin | null = null;
    private hashPassword: string;

    private constructor(passwordHash: string) {
        this.hashPassword = passwordHash;
    }

    static initialize(password: string): void {
        if (!Admin.instance) {
            const passwordHash = bcrypt.hashSync(password, adminConst.saltRounds);
            Admin.instance = new Admin(passwordHash);
        } else {
            throw new Error("L'instance Admin a déjà été initialisée.");
        }
    }

    static isInitialized(): boolean {
        return Admin.instance !== null;
    }

    static resetInstance(): void {
        delete Admin.instance;
        if (global.gc) {
            global.gc();
        }
    }

    static getInstance(): Admin {
        if (!Admin.instance) {
            throw new Error("L'instance Admin n'a pas été initialisée. Appelez Admin.initialize(password) d'abord.");
        }
        return Admin.instance;
    }

    async validPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.hashPassword);
    }
}
