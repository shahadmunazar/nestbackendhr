import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { UsersModule } from './users/users.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    PrismaModule,
    TenantModule,
    UsersModule,
    AuthModule,
    LocationModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
