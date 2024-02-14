import { AdminService } from '@app/services/login/authentication.service';
import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

const OK = 200;

@ApiTags('Auth')
@Controller('auth')
export class AuthenticationController {
    constructor(private readonly adminService: AdminService) {}

    @Post('login')
    @HttpCode(OK)
    async login(@Body() body: { password: string }): Promise<{ accessToken: string }> {
        const token = await this.adminService.validateAdminPassword(body.password);
        if (!token) {
            throw new UnauthorizedException('Accès refusé');
        } else {
            return { accessToken: token };
        }
    }
}
