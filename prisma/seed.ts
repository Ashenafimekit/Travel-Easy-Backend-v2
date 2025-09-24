import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // Seed users safely

    const password: string = 'Melos@TE';
    const salt = Number(process.env.SALT_ROUND) || 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    await tx.user.upsert({
      where: { email: 'ashumekit502@gmail.com' },
      update: {},
      create: {
        name: 'Ashenafi Mekit',
        email: 'ashumekit502@gmail.com',
        phone: '942240594',
        password: hashedPassword,
        role: 'STAFF',
      },
    });

    await tx.user.upsert({
      where: { email: 'melos@gmail.com' },
      update: {},
      create: {
        name: 'Melos Mekit',
        email: 'melos@gmail.com',
        phone: '977681970',
        password: hashedPassword,
        role: 'PASSENGER',
      },
    });

    // Seed buses (parallel for performance)
    await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        const bus = await tx.bus.upsert({
          where: { busNumber: i + 1 },
          update: {},
          create: {
            busNumber: i + 1,
            capacity: 51,
          },
        });

        // Generate seats for each bus
        const seats = Array.from({ length: bus.capacity }, (_, index) => ({
          seatNumber: `S${index + 1}`,
          busId: bus.id,
        }));

        // Create seats if not exist (skipDuplicates avoids duplicate seeding runs)
        await tx.seat.createMany({
          data: seats,
          skipDuplicates: true,
        });

        return bus;
      }),
    );

    // Seed routes
    const Routes = [
      {
        departure: 'ADDIS ABABA',
        destination: 'DIRE DAWA',
        price: 1800,
        distanceKm: 445,
        estimatedDuration: 8.0,
      },
      {
        departure: 'DIRE DAWA',
        destination: 'ADDIS ABABA',
        price: 1800,
        distanceKm: 445,
        estimatedDuration: 8.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'HARAR',
        price: 1900,
        distanceKm: 526,
        estimatedDuration: 10.0,
      },
      {
        departure: 'HARAR',
        destination: 'ADDIS ABABA',
        price: 1900,
        distanceKm: 526,
        estimatedDuration: 10.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'ADAMA (NAZRET)',
        price: 500,
        distanceKm: 99,
        estimatedDuration: 2.0,
      },
      {
        departure: 'ADAMA (NAZRET)',
        destination: 'ADDIS ABABA',
        price: 500,
        distanceKm: 99,
        estimatedDuration: 2.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'BAHIR DAR',
        price: 2000,
        distanceKm: 565,
        estimatedDuration: 10.0,
      },
      {
        departure: 'BAHIR DAR',
        destination: 'ADDIS ABABA',
        price: 2000,
        distanceKm: 565,
        estimatedDuration: 10.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'GONDAR',
        price: 2500,
        distanceKm: 725,
        estimatedDuration: 13.0,
      },
      {
        departure: 'GONDAR',
        destination: 'ADDIS ABABA',
        price: 2500,
        distanceKm: 725,
        estimatedDuration: 13.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'MEKELE',
        price: 3000,
        distanceKm: 780,
        estimatedDuration: 14.0,
      },
      {
        departure: 'MEKELE',
        destination: 'ADDIS ABABA',
        price: 3000,
        distanceKm: 780,
        estimatedDuration: 14.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'DESSIE',
        price: 1500,
        distanceKm: 400,
        estimatedDuration: 7.0,
      },
      {
        departure: 'DESSIE',
        destination: 'ADDIS ABABA',
        price: 1500,
        distanceKm: 400,
        estimatedDuration: 7.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'JIMMA',
        price: 1500,
        distanceKm: 350,
        estimatedDuration: 6.5,
      },
      {
        departure: 'JIMMA',
        destination: 'ADDIS ABABA',
        price: 1500,
        distanceKm: 350,
        estimatedDuration: 6.5,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'HAWASSA',
        price: 800,
        distanceKm: 275,
        estimatedDuration: 5.0,
      },
      {
        departure: 'HAWASSA',
        destination: 'ADDIS ABABA',
        price: 800,
        distanceKm: 275,
        estimatedDuration: 5.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'ARBAMINCH',
        price: 1900,
        distanceKm: 505,
        estimatedDuration: 9.0,
      },
      {
        departure: 'ARBAMINCH',
        destination: 'ADDIS ABABA',
        price: 1900,
        distanceKm: 505,
        estimatedDuration: 9.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'NEKEMTE',
        price: 1000,
        distanceKm: 331,
        estimatedDuration: 6.0,
      },
      {
        departure: 'NEKEMTE',
        destination: 'ADDIS ABABA',
        price: 1000,
        distanceKm: 331,
        estimatedDuration: 6.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'ASSOSA',
        price: 2000,
        distanceKm: 660,
        estimatedDuration: 12.0,
      },
      {
        departure: 'ASSOSA',
        destination: 'ADDIS ABABA',
        price: 2000,
        distanceKm: 660,
        estimatedDuration: 12.0,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'SEMERA',
        price: 1900,
        distanceKm: 580,
        estimatedDuration: 10.5,
      },
      {
        departure: 'SEMERA',
        destination: 'ADDIS ABABA',
        price: 1900,
        distanceKm: 580,
        estimatedDuration: 10.5,
      },
      {
        departure: 'ADDIS ABABA',
        destination: 'GAMBELLA',
        price: 2200,
        distanceKm: 777,
        estimatedDuration: 14.0,
      },
      {
        departure: 'GAMBELLA',
        destination: 'ADDIS ABABA',
        price: 2200,
        distanceKm: 777,
        estimatedDuration: 14.0,
      },
    ];

    const routePromises = Routes.map((route) =>
      tx.route.upsert({
        where: {
          departure_destination: {
            departure: route.departure,
            destination: route.destination,
          },
        },
        update: {},
        create: route,
      }),
    );

    await Promise.all(routePromises);

    const routes = await tx.route.findMany();
    const buses = await tx.bus.findMany();

    const tripPromises = Array.from({ length: 20 }).map(async () => {
      // Pick a random route
      const route = routes[Math.floor(Math.random() * routes.length)];

      // Pick 1–3 random buses
      const shuffledBuses = buses.sort(() => 0.5 - Math.random());
      const selectedBuses = shuffledBuses.slice(
        0,
        Math.floor(Math.random() * 3) + 1,
      );

      // Generate a random trip date within the next 30 days
      const now = new Date();
      const randomDate = new Date(
        now.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      );

      return tx.trip.upsert({
        where: {
          id_tripDate_routeId: {
            id: '',
            routeId: route.id,
            tripDate: randomDate,
          },
        },
        update: {
          buses: { set: [], connect: selectedBuses.map((b) => ({ id: b.id })) },
        },
        create: {
          routeId: route.id,
          tripDate: randomDate,
          buses: { connect: selectedBuses.map((b) => ({ id: b.id })) },
        },
      });
    });

    await Promise.all(tripPromises);
  });
}

main()
  .then(async () => {
    console.log('Seeding completed');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
