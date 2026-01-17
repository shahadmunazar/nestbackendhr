import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      // In enterprise saas, you might want to throw or just allow public access.
      // User requirements: "tenantId injected into request context"
      // "All Prisma queries must be tenant-scoped" implies we need a tenant ID.
      throw new BadRequestException('X-Tenant-ID header is missing');
    }

    this.cls.set('tenantId', tenantId);
    next();
  }
}
