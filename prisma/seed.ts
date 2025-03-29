import {
  PrismaClient,
  UserRole,
  Gender,
  Status,
  PaymentMethod,
  Service,
  BloodGroup,
  WeekDay,
  ProviderType,
  RecurrenceType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Tenants
  for (let i = 0; i < 5; i++) {
    const tenant = await prisma.tenant.create({
      data: {
        name: faker.company.name(),
        domain: faker.internet.domainName(),
        contactEmail: faker.internet.email(),
        billingCycle: faker.helpers.arrayElement(Object.values(RecurrenceType)),
      },
    });

    // Create Users for each Tenant
    for (let j = 0; j < 6; j++) {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(), // Updated to use faker.person
          email: faker.internet.email(),
          password: faker.internet.password(),
          phone: faker.phone.number(),
          role: faker.helpers.arrayElement(Object.values(UserRole)),
          gender: faker.helpers.arrayElement(Object.values(Gender)),
          dateOfBirth: faker.date.past({ years: 30 }),
          bloodGroup: faker.helpers.arrayElement(Object.values(BloodGroup)),
          tenantId: tenant.id,
        },
      });

      const serviceProvider = await prisma.serviceProvider.create({
        data: {
          name: faker.person.fullName(),
          providerType: faker.helpers.arrayElement(Object.values(ProviderType)), // Replace with actual ProviderType enum values
          fee: faker.number.int({ min: 100, max: 1000 }),
          experience: faker.number.int({ min: 1, max: 20 }),
          description: faker.lorem.sentence(),
          specialization: faker.helpers.arrayElement([
            'Cardiology',
            'Neurology',
            'Orthopedics',
          ]),
        },
      });

      // Create Schedules
      const schedule = await prisma.schedule.create({
        data: {
          date: faker.date.future(),
          dayOfWeek: faker.helpers.arrayElement(Object.values(WeekDay)), // Use the correct enum for days of the week
          isRecurring: faker.datatype.boolean(),
          recurrenceType: faker.helpers.arrayElement(
            Object.values(RecurrenceType),
          ), // Use the correct enum for recurrence types
          startTime: faker.date.future(),
          endTime: faker.date.future(),
          slotDuration: faker.number.int({ min: 15, max: 60 }),
          location: faker.location.streetAddress(),
          serviceProviderId: serviceProvider.id, // Link the schedule to the service provider
          serviceType: faker.helpers.arrayElement(Object.values(Service)), // Use Service enum values
        },
      });

      // Create ClinicInfo
      const clinicInfo = await prisma.clinicInfo.create({
        data: {
          clinicName: faker.company.name(),
          contact: faker.phone.number(),
          address: {
            create: {
              address: faker.location.streetAddress(), // Replace 'line1' with the correct field name from your schema
              city: faker.location.city(),
              state: faker.location.state(),
              pincode: faker.location.zipCode(),
              country: faker.location.country(),
              user: {
                connect: {
                  id: (await prisma.user.findFirst())?.id || '', // Connect to an existing user
                },
              },
            },
          },
          serviceProviders: {
            connect: { id: serviceProvider.id }, // Link the clinic to the created service provider
          },
        },
      });

      // Create Slots
      for (let k = 0; k < 10; k++) {
        await prisma.slot.create({
          data: {
            startTime: faker.date.future(),
            endTime: faker.date.future(),
            isBooked: false,
            scheduleId: schedule.id, // Use the created schedule's ID
            clinicInfoId: clinicInfo.id, // Use the created ClinicInfo's ID
          },
        });
      }

      // Create Appointments for Patients
      if (user.role === 'PATIENT') {
        for (let k = 0; k < 3; k++) {
          // Find an available slot
          const availableSlot = await prisma.slot.findFirst({
            where: { isBooked: false },
          });

          if (!availableSlot) {
            console.log('No available slots for booking.');
            continue;
          }

          // Create an appointment for the available slot
          const appointment = await prisma.appointment.create({
            data: {
              service: faker.helpers.arrayElements(Object.values(Service), 2),
              status: faker.helpers.arrayElement(Object.values(Status)),
              dateTime: availableSlot.startTime, // Use the slot's start time for the appointment
              reason: faker.lorem.sentence(),
              userId: user.id,
              slotId: availableSlot.id, // Link the appointment to the slot
            },
          });

          // Mark the slot as booked
          await prisma.slot.update({
            where: { id: availableSlot.id },
            data: { isBooked: true },
          });

          // Create Payments for Appointments
          await prisma.payment.create({
            data: {
              transactionId: faker.string.uuid(),
              amount: parseFloat(
                faker.finance.amount({ min: 100, max: 1000, dec: 2 }),
              ),
              status: faker.helpers.arrayElement(Object.values(Status)),
              paymentMethod: faker.helpers.arrayElement(
                Object.values(PaymentMethod),
              ),
              appointmentId: appointment.id,
              userId: user.id,
            },
          });
        }
      }
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e: Error) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
