
import { Controller, Get, Param, Query, HttpStatus, Res } from '@nestjs/common';
import { LocationService } from './location.service';
import type { Response } from 'express';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get('countries')
    async getCountries(@Query('search') search: string, @Res() res: Response) {
        try {
            const countries = await this.locationService.getCountries(search);
            return res.status(HttpStatus.OK).json({
                success: true,
                data: countries,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    @Get('states/:countryId')
    async getStates(
        @Param('countryId') countryId: string,
        @Query('search') search: string,
        @Res() res: Response,
    ) {
        try {
            const states = await this.locationService.getStates(countryId, search);
            return res.status(HttpStatus.OK).json({
                success: true,
                data: states,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    @Get('cities/:stateId')
    async getCities(
        @Param('stateId') stateId: string,
        @Query('search') search: string,
        @Res() res: Response,
    ) {
        try {
            const cities = await this.locationService.getCities(stateId, search);
            return res.status(HttpStatus.OK).json({
                success: true,
                data: cities,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}
