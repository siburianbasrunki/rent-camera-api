// import { PrismaClient } from "@prisma/client";
// import { sendBookingReminderEmail } from "./email.service";
// const prisma = new PrismaClient();
// export const checkBookingsNearEnd = async () => {
//   try {
//     // Hitung waktu 5 jam dari sekarang
//     const now = new Date();
//     const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
//     // Cari booking yang:
//     // 1. Status PAID atau IN_USE
//     // 2. endDate dalam 5 jam ke depan
//     // 3. Belum dikirim reminder (atau Anda bisa tambahkan flag jika perlu)
//     const upcomingBookings = await prisma.booking.findMany({
//       where: {
//         AND: [
//           {
//             OR: [
//               { status: "PAID" },
//               { status: "IN_USE" }
//             ]
//           },
//           {
//             endDate: {
//               lte: fiveHoursLater,
//               gte: now // Memastikan belum lewat endDate
//             }
//           }
//         ]
//       },
//       include: {
//         user: true,
//         camera: true
//       }
//     });
//     // Kirim email untuk setiap booking yang ditemukan
//     for (const booking of upcomingBookings) {
//       try {
//         const hoursLeft = Math.ceil(
//           (new Date(booking.endDate).getTime() - now.getTime()) / (1000 * 60 * 60)
//         );
//         await sendBookingReminderEmail(booking.user.email, booking.user.name, {
//           cameraName: booking.camera.name,
//           endDate: booking.endDate.toISOString(),
//           hoursLeft
//         });
//         console.log(`Reminder sent for booking ${booking.id}`);
//       } catch (error) {
//         console.error(`Failed to send reminder for booking ${booking.id}:`, error);
//       }
//     }
//   } catch (error) {
//     console.error("Error checking upcoming bookings:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// };
//# sourceMappingURL=bookingReminder.service.js.map