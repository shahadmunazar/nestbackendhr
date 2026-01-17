import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResendVerificationDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
