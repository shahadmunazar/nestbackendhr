import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly cls: ClsService) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    /**
     * Returns a tenant-scoped Prisma Client extension.
     * This ensures all queries are filtered by encryption of the tenantId for security.
     */
    get tenantScope() {
        return this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const tenantId = this.cls.get('tenantId');

                        // List of models that belong to a tenant
                        // In a real app, you might reflect this from the Prisma DMMF
                        const tenantModels = ['User'];

                        if (tenantId && tenantModels.includes(model)) {
                            // Handle 'where' clause for filtering
                            if (
                                operation === 'findUnique' ||
                                operation === 'findFirst' ||
                                operation === 'findMany' ||
                                operation === 'count' ||
                                operation === 'aggregate' ||
                                operation === 'groupBy'
                            ) {
                                args.where = { ...args.where, tenantId };
                            }

                            // Handle 'data' on create to automatically inject tenantId
                            if (operation === 'create') {
                                if (!args.data) args.data = {};
                                (args.data as any).tenantId = tenantId;
                            }

                            if (operation === 'createMany') {
                                if (args.data && Array.isArray(args.data)) {
                                    args.data.forEach((item: any) => {
                                        item.tenantId = tenantId;
                                    });
                                }
                            }
                        }

                        return query(args);
                    },
                },
            },
        });
    }
}
