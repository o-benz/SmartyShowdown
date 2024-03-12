import * as bcrypt from 'bcrypt';
import { Admin } from './admin.model';

describe('Admin', () => {
    const initialPassword = 'initialPassword';

    beforeAll(() => {
        Admin.resetInstance();
    });

    beforeEach(() => {
        Admin.resetInstance();
    });

    it('should initialize successfully and store a hashed password', async () => {
        Admin.initialize(initialPassword);
        const admin = Admin.getInstance();
        expect(Admin.isInitialized()).toBe(true);
        const isPasswordCorrect = await bcrypt.compare(initialPassword, admin['hashPassword']);

        expect(isPasswordCorrect).toBeTruthy();
    });
    it('should throw an error if initialize is called more than once', () => {
        Admin.initialize(initialPassword);
        expect(() => Admin.initialize(initialPassword)).toThrow("L'instance Admin a déjà été initialisée.");
    });

    it('should throw an error if getInstance is called before initialize', () => {
        expect(() => Admin.getInstance()).toThrow("L'instance Admin n'a pas été initialisée. Appelez Admin.initialize(password) d'abord.");
    });

    describe('after initialization', () => {
        beforeEach(() => {
            Admin.initialize(initialPassword);
        });

        it('should return the same instance when getInstance is called', () => {
            const instance1 = Admin.getInstance();
            const instance2 = Admin.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('should validate a correct password', async () => {
            const admin = Admin.getInstance();
            const isValid = await admin.validPassword(initialPassword);
            expect(isValid).toBeTruthy();
        });

        it('should invalidate an incorrect password', async () => {
            const admin = Admin.getInstance();
            const isValid = await admin.validPassword('wrongPassword');
            expect(isValid).toBeFalsy();
        });
    });
});
