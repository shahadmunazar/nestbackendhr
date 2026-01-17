
import { Controller, Post, Body, Res, HttpStatus, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './dto/password.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            const result = await this.authService.login(loginDto);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
        try {
            const result = await this.authService.register(registerDto);
            return res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    success: false,
                    errors: error.message,
                    status: error.status
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                errors: error.message,
            });
        }
    }
    @Get('verify')
    async verify(@Query('token') token: string, @Res() res: Response) {
        try {
            await this.authService.verifyEmail(token);
            // Redirect to frontend login with success message
            // or return JSON if handling via frontend logic
            // User requirement: "send email to verify same as well"
            // Usually this link opens the frontend.
            // If the link is to backend, we should redirect to frontend.
            // Let's assume the link points to frontend /auth/verify which calls this API, OR link points to backend
            // In MailService I set link to: process.env.FRONTEND_URL/auth/verify?token=...
            // So this endpoint is likely called BY the frontend component.
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res() res: Response) {
        try {
            const result = await this.authService.logout(req.user.id);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
        try {
            const result = await this.authService.forgotPassword(forgotPasswordDto);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
        try {
            const result = await this.authService.resetPassword(resetPasswordDto);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    @Post('resend-verification')
    async resendVerification(@Body() resendVerificationDto: ResendVerificationDto, @Res() res: Response) {
        try {
            const result = await this.authService.resendVerification(resendVerificationDto);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }
}
