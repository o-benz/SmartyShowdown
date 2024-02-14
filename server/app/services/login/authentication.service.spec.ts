import * as adminClass from '@app/classes/admin.model';
import { Admin } from '@app/classes/admin.model';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './authentication.service';

describe('AdminService', () => {
    let service: AdminService;
    let jwtServiceMock: jest.Mocked<JwtService>;

    beforeEach(() => {
        jwtServiceMock = {
            sign: jest.fn(),
        } as unknown as jest.Mocked<JwtService>;

        Admin.resetInstance();
        service = new AdminService(jwtServiceMock);
    });

    it('should throw an error if admin is not initialized properly', async () => {
        jest.spyOn(adminClass.Admin.prototype, 'validPassword').mockResolvedValue(false);

        await expect(service.validateAdminPassword('some-password')).rejects.toThrow();
    });

    it('should return a token for a valid password', async () => {
        const expectedToken = 'expectedToken';
        jest.spyOn(adminClass.Admin.prototype, 'validPassword').mockResolvedValue(true);
        jwtServiceMock.sign.mockReturnValue(expectedToken);

        const result = await service.validateAdminPassword('valid-password');

        expect(result).toBe(expectedToken);
        expect(jwtServiceMock.sign).toHaveBeenCalledWith({ role: 'admin' });
    });
});
