import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './dto/password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { QueueService } from '../queue/queue.service';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private queueService: QueueService,
        private jwtService: JwtService
    ) { }

    async login(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: {
                boxUsers: {
                    include: {
                        box: true
                    }
                }
            }
        });

        if (!user) {
            throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
        }

        // Check if password exists
        if (!user.password) {
            throw new HttpException('Account setup incomplete.', HttpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            // Increment failed attempts
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: { failed_login_attempts: { increment: 1 } }
            });

            if (updatedUser.failed_login_attempts >= 5) {
                // Reset attempts and trigger forgot password
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { failed_login_attempts: 0 }
                });

                // Trigger forgot password flow
                await this.forgotPassword({ email: user.email });

                throw new HttpException('Too many failed attempts. A password reset link has been sent to your email.', HttpStatus.TOO_MANY_REQUESTS);
            }

            throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
        }

        // Reset failed attempts on success
        if (user.failed_login_attempts > 0) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failed_login_attempts: 0 }
            });
        }

        if (!user.email_verified_at) {
            throw new HttpException('EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
        }

        // Get the first active box slug associated with this user
        const boxUser = user.boxUsers.find(bu => bu.status === 'Enable' || bu.status === 'active');
        const boxSlug = boxUser?.box?.slug || null;

        // Generate JWT Token
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return {
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                box_slug: boxSlug,
                token: token
            }
        };
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { remember_token: null }
        });
        return { success: true, message: 'Logged out successfully' };
    }

    async register(data: RegisterDto) {
        // 1. Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            if (existingUser.email_verified_at) {
                throw new HttpException('Email is already taken and verified.', HttpStatus.UNPROCESSABLE_ENTITY); // 422
            } else {
                throw new HttpException(
                    'Your Email is not yet verified, Click here to Resend email verification link',
                    HttpStatus.UNPROCESSABLE_ENTITY, // 422
                );
            }
        }

        // 2. Check if company name (Box) is taken
        const companyName = data.company_name || 'My Company';
        const slug = this.generateSlug(companyName);
        const domain = `${slug}.mycrm.com`;

        const existingBox = await this.prisma.box.findFirst({
            where: {
                OR: [
                    { slug: slug },
                    { domain: domain }
                ]
            }
        });

        if (existingBox) {
            throw new HttpException('This Company Name is Already taken.', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Transaction to ensure atomicity
        const result = await this.prisma.$transaction(async (tx) => {
            // 3. Create User
            const tempPassword = crypto.randomBytes(5).toString('hex'); // 10 chars
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            const token = crypto.randomBytes(30).toString('hex'); // 60 chars

            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    remember_token: token,
                    verification_token: verificationToken,
                    token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                }
            });

            // 4. Create Box
            const workingDays = JSON.stringify([
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ]);

            const box = await tx.box.create({
                data: {
                    superadmin_id: user.id,
                    name: data.company_name,
                    slug: slug,
                    domain: domain,
                    industry: data.industry,
                    address: data.address,
                    pincode: data.pincode,
                    phone: data.phone,
                    mobile: data.phone,
                    contact_name: data.name,
                    country_id: data.country_id,
                    state_id: data.state_id,
                    city_id: data.city_id,
                    working_days: workingDays,
                    day_start_time: '10:00',
                    day_end_time: '18:00',
                    start_date: new Date(),
                    status: 'active'
                }
            });

            // 5. Create BoxUser (Employee)
            const companyPrefix = slug.substring(0, 2).toUpperCase();
            const employeeId = `${companyPrefix}-01`;

            await tx.boxUser.create({
                data: {
                    box_id: box.id,
                    user_id: user.id,
                    added_by: user.id,
                    first_name: data.name,
                    username: data.email,
                    phone: data.phone,
                    company: data.company_name,
                    address: data.address,
                    employee_id: employeeId,
                    staff_role: 'admin',
                    status: 'Disabled',
                    joining_date: new Date(),
                }
            });

            // 6. Assign Roles
            const roleNames = ['admin', 'superadmin', 'employee'];

            for (const roleName of roleNames) {
                let role = await tx.role.findUnique({ where: { name: roleName } });
                if (!role) {
                    role = await tx.role.create({
                        data: { name: roleName, status: 'active' }
                    });
                }

                await tx.roleUser.create({
                    data: {
                        user_id: user.id,
                        role_id: role.id
                    }
                });
            }

            return {
                user,
                box,
                tempPassword
            };
        });

        // Add Job to Queue (Async)
        await this.queueService.addJob('EMAIL_VERIFICATION', {
            email: result.user.email,
            name: result.user.name,
            token: verificationToken,
            password: result.tempPassword
        });

        return {
            success: true,
            // Updated message to reflect that password is in the email
            message: 'Registration successful. A verification link and your login password have been sent to your email.',
            data: {
                user_id: result.user.id,
                box_id: result.box.id,
                email: result.user.email,
                // temp_password removed
            }
        };
    }

    private generateSlug(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verification_token: token },
        });

        if (!user) {
            throw new HttpException('Invalid verification token.', HttpStatus.BAD_REQUEST);
        }

        if (user.token_expires_at && user.token_expires_at < new Date()) {
            throw new HttpException('Verification token has expired. Please register again or request a new link.', HttpStatus.GONE);
        }

        if (user.email_verified_at) {
            return { success: true, message: 'Email already verified.' };
        }

        return await this.prisma.$transaction(async (tx) => {
            // 1. Update User
            await tx.user.update({
                where: { id: user.id },
                data: {
                    email_verified_at: new Date(),
                    verification_token: null,
                    token_expires_at: null
                },
            });

            // 2. Update BoxUser status to 'Enable'
            await tx.boxUser.updateMany({
                where: { user_id: user.id },
                data: { status: 'Enable' }
            });

            return { success: true };
        });
    }

    async forgotPassword(data: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            // We return success even if user not found for security reasons
            return { success: true, message: 'If an account with that email exists, we have sent a password reset link.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                verification_token: resetToken,
                token_expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            }
        });

        await this.queueService.addJob('FORGOT_PASSWORD', {
            email: user.email,
            name: user.name,
            token: resetToken
        });

        return { success: true, message: 'If an account with that email exists, we have sent a password reset link.' };
    }

    async resetPassword(data: ResetPasswordDto) {
        const user = await this.prisma.user.findFirst({
            where: { verification_token: data.token }
        });

        if (!user || (user.token_expires_at && user.token_expires_at < new Date())) {
            throw new HttpException('Invalid or expired reset token.', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verification_token: null,
                token_expires_at: null
            }
        });

        return { success: true, message: 'Password has been reset successfully.' };
    }

    async resendVerification(data: ResendVerificationDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }

        if (user.email_verified_at) {
            throw new HttpException('Email is already verified.', HttpStatus.BAD_REQUEST);
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                verification_token: verificationToken,
                token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });

        await this.queueService.addJob('EMAIL_VERIFICATION', {
            email: user.email,
            name: user.name,
            token: verificationToken
        });

        return { success: true, message: 'Verification email has been resent.' };
    }
}
