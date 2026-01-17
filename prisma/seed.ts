
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');


    // Seed Roles
    const roles = ['admin', 'superadmin', 'employee', 'client'];
    console.log('Seeding Roles...');
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: {
                name: roleName,
                status: 'active',
            },
        });
    }

    // Paths to JSON files
    const countriesPath = path.join(__dirname, '../src/jsondata/countries.json');
    const statesPath = path.join(__dirname, '../src/jsondata/states.json');
    const citiesPath = path.join(__dirname, '../src/jsondata/cities.json');

    // Helper to read detailed JSON format
    const readJsonData = (filePath: string) => {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(rawData);
        // The data is located in the 3rd element (index 2) which is of type "table"
        const tableData = json.find((item: any) => item.type === 'table');
        return tableData ? tableData.data : [];
    };

    const countries = readJsonData(countriesPath);
    const states = readJsonData(statesPath);
    const cities = readJsonData(citiesPath);

    console.log(`Found ${countries.length} countries, ${states.length} states, ${cities.length} cities.`);

    // Seed Countries
    console.log('Seeding Countries...');
    for (const country of countries) {
        await prisma.country.upsert({
            where: { id: country.id },
            update: {
                name: country.name,
                code: country.code,
                dialing_code: country.dialing_code,
                status: country.status,
            },
            create: {
                id: country.id,
                name: country.name,
                code: country.code,
                dialing_code: country.dialing_code,
                status: country.status,
            },
        });
    }

    // Seed States
    console.log('Seeding States...');
    // Process in chunks to avoid overwhelming the database connection if needed, 
    // but for ~4000 records sequential loop is fine or Promise.all in batches.
    // Sequential is safer for order and avoiding race conditions if there were any unique constraints dependent on others (none here except foreign keys).
    for (const state of states) {
        // Ensure the related country exists (it should if we just seeded them)
        // We ignore states that point to non-existent countries to avoid FK constraints errors if JSON is inconsistent
        // However, assuming JSON is consistent.
        try {
            await prisma.state.upsert({
                where: { id: state.id },
                update: {
                    name: state.name,
                    code: state.code,
                    country_id: state.country_id,
                    status: state.status,
                },
                create: {
                    id: state.id,
                    name: state.name,
                    code: state.code,
                    country_id: state.country_id,
                    status: state.status,
                },
            });
        } catch (e) {
            console.warn(`Skipping state ${state.name} (ID: ${state.id}) - likely missing country ID ${state.country_id}`);
        }
    }

    // Seed Cities
    console.log('Seeding Cities...');
    // Cities is ~48k records. Batching is recommended here.
    const batchSize = 100;
    for (let i = 0; i < cities.length; i += batchSize) {
        const batch = cities.slice(i, i + batchSize);
        await Promise.all(batch.map(async (city: any) => {
            try {
                await prisma.city.upsert({
                    where: { id: city.id },
                    update: {
                        name: city.name,
                        state_id: city.state_id,
                        status: city.status,
                        lat: city.lat,
                        lng: city.lng,
                    },
                    create: {
                        id: city.id,
                        name: city.name,
                        state_id: city.state_id,
                        status: city.status,
                        lat: city.lat,
                        lng: city.lng,
                    },
                });
            } catch (e) {
                // console.warn(`Skipping city ${city.name} (ID: ${city.id})`);
            }
        }));
        if (i % 1000 === 0) {
            console.log(`Processed ${i} cities...`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
