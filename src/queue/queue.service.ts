
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class QueueService implements OnApplicationBootstrap {
    private readonly logger = new Logger(QueueService.name);
    private isProcessing = false;

    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    onApplicationBootstrap() {
        // Start the processing loop
        setInterval(() => this.processJobs(), 5000); // Check every 5 seconds
        this.logger.log('Job Queue Processor started.');
    }

    async addJob(type: string, payload: any) {
        await this.prisma.job.create({
            data: {
                type,
                payload: JSON.stringify(payload),
                status: 'PENDING'
            }
        });
        this.logger.log(`Job of type ${type} added to queue.`);
    }

    private async processJobs() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Fetch one pending job
            // Using a simple lock mechanism by status
            const job = await this.prisma.job.findFirst({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'asc' }
            });

            if (!job) {
                this.isProcessing = false;
                return;
            }

            // Mark as PROCESSING
            await this.prisma.job.update({
                where: { id: job.id },
                data: { status: 'PROCESSING' }
            });

            this.logger.log(`Processing Job ${job.id} (${job.type})...`);

            try {
                const payload = JSON.parse(job.payload);

                switch (job.type) {
                    case 'EMAIL_VERIFICATION':
                        await this.mailService.sendVerificationEmail(payload.email, payload.name, payload.token, payload.password);
                        break;
                    case 'FORGOT_PASSWORD':
                        await this.mailService.sendForgotPasswordEmail(payload.email, payload.name, payload.token);
                        break;
                    default:
                        this.logger.warn(`Unknown job type: ${job.type}`);
                }

                // Mark as COMPLETED
                await this.prisma.job.update({
                    where: { id: job.id },
                    data: { status: 'COMPLETED' }
                });
                this.logger.log(`Job ${job.id} COMPLETED.`);

            } catch (error) {
                this.logger.error(`Job ${job.id} FAILED: ${error.message}`, error.stack);

                // Mark as FAILED (or retry logic could go here)
                await this.prisma.job.update({
                    where: { id: job.id },
                    data: {
                        status: 'FAILED',
                        lastError: error.message,
                        attempts: { increment: 1 }
                    }
                    // For simple logic, we just fail it. A real system would check attempts < maxAttempts -> PENDING
                });
            }

        } catch (err) {
            this.logger.error('Error in job processor loop', err);
        } finally {
            this.isProcessing = false;
        }
    }
}
