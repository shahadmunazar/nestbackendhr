
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(7)
    @MaxLength(15)
    phone: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    company_name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    industry: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    country_id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    state_id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    city_id: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(10)
    pincode: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    address: string;
}
