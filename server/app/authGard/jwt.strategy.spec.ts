import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return a user object with role', async () => {
            const mockPayload = { role: 'admin' };
            jest.spyOn(jwtStrategy, 'validate').mockImplementation(async () => mockPayload);

            const result = await jwtStrategy.validate(mockPayload);
            expect(result).toEqual({ role: 'admin' });
        });

        it('should throw an error if payload is invalid', async () => {
            const mockPayload = { role: 'admin' };
            jest.spyOn(jwtStrategy, 'validate').mockRejectedValue(new Error('Invalid token'));

            try {
                await jwtStrategy.validate(mockPayload);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Invalid token');
            }
        });
    });
});
