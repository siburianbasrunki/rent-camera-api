import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { level: "warn", emit: "event" },
      { level: "info", emit: "event" },
      { level: "error", emit: "event" },
    ],
    errorFormat: "minimal",
    // Tambahkan konfigurasi ini untuk menghindari masalah prepared statement
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Optional: Add middleware or extensions if needed
prisma.$use(async (params, next) => {
  // Add your middleware here
  return next(params);
});

// Export individual models for better TypeScript support
export const brandClient = prisma.brand;
export const cameraClient = prisma.camera;
export const bannerClient = prisma.banner;
export const userClient = prisma.user;
export const BookingClient = prisma.booking;
export const CameraPhoto = prisma.cameraPhoto
export default prisma;