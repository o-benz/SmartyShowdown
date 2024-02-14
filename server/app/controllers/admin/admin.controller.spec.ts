import { AdminService } from '@app/services/login/authentication.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthenticationController } from './admin.controller';

const OK = 200;
const UNAUTHORIZED = 401;

describe('AuthenticationController (e2e)', () => {
    let app: INestApplication;

    const mockAdminService = {
        validateAdminPassword: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [AuthenticationController],
            providers: [
                {
                    provide: AdminService,
                    useValue: mockAdminService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/login (POST) - Valid Password', async () => {
        const validPassword = 'LOG2990-101';
        const mockToken = 'mockedAccessToken';
        mockAdminService.validateAdminPassword.mockResolvedValue(mockToken);

        const response = await request(app.getHttpServer()).post('/auth/login').send({ password: validPassword }).expect(OK);

        expect(response.body).toEqual({ accessToken: mockToken });
    });

    it('/auth/login (POST) - Invalid Password', async () => {
        const invalidPassword = 'incorrectPassword';
        mockAdminService.validateAdminPassword.mockResolvedValue(null);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ password: invalidPassword })
            .expect(UNAUTHORIZED)
            .then((response) => {
                expect(response.body.message).toBe('Accès refusé');
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
