
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [MailModule, PrismaModule],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule { }
