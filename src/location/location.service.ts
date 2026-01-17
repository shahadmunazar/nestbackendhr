
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
    constructor(private prisma: PrismaService) { }

    async getCountries(search?: string) {
        return this.prisma.country.findMany({
            where: {
                status: 'Enable',
                name: search ? { contains: search } : undefined,
            },
            orderBy: { name: 'asc' },
        });
    }

    async getStates(countryId: string, search?: string) {
        return this.prisma.state.findMany({
            where: {
                country_id: countryId,
                status: 'Enable',
                name: search ? { contains: search } : undefined,
            },
            orderBy: { name: 'asc' },
        });
    }

    async getCities(stateId: string, search?: string) {
        return this.prisma.city.findMany({
            where: {
                state_id: stateId,
                status: 'Enable',
                name: search ? { contains: search } : undefined,
            },
            orderBy: { name: 'asc' },
            take: 100 // Limit results for performance, especially if no search term
        });
    }
}
