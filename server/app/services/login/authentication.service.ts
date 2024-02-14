import { Admin } from '@app/classes/admin.model';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    private admin: Admin;

    constructor(private jwtService: JwtService) {
        Admin.initialize('LOG2990-101');
        this.admin = Admin.getInstance();
    }

    async validateAdminPassword(password: string): Promise<string> {
        const isValidPassword = await this.admin.validPassword(password);
        if (!isValidPassword) {
            throw new Error("L'instance Admin n'est pas encore initialisée.");
        }

        const adminPayload = { role: 'admin' };
        return this.jwtService.sign(adminPayload);
    }
}
