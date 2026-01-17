import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    HttpStatus
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming req.user is set by an AuthGuard (e.g. JWT)

        // 1. Check if User is Authenticated
        if (!user) {
            throw new UnauthorizedException('Your session has expired. Please login again.');
        }

        // 2. Check Roles if required
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = await this.checkUserRoles(user.id, requiredRoles);
            if (!hasRole) {
                throw new ForbiddenException('Unauthorized: You do not have permission to access this resource.');
            }
        }

        // 3. Check Box and Membership (Tenant Context)
        const boxSlug = request.params.box_slug || request.headers['x-box-slug'];

        if (boxSlug) {
            const box = await this.prisma.box.findUnique({
                where: { slug: boxSlug }
            });

            if (!box) {
                throw new NotFoundException('Box not found. Please login again.');
            }

            const isInBox = await this.prisma.boxUser.findFirst({
                where: {
                    box_id: box.id,
                    user_id: user.id
                }
            });

            if (!isInBox) {
                throw new ForbiddenException('You are not a member of this box. Please login again.');
            }

            // Set context for use in controllers/services
            request.box_slug = boxSlug;
            request.box = box;
            request.box_user = isInBox;
        }

        return true;
    }

    private async checkUserRoles(userId: string, requiredRoles: string[]): Promise<boolean> {
        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!userWithRoles) return false;

        const userRoleNames = userWithRoles.userRoles.map(ur => ur.role.name);
        return requiredRoles.some(role => userRoleNames.includes(role));
    }
}
