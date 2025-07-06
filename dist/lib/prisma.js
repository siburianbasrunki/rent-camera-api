"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingClient = exports.userClient = exports.bannerClient = exports.cameraClient = exports.brandClient = void 0;
const client_1 = require("@prisma/client");
const prisma = global.prisma ||
    new client_1.PrismaClient({
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
exports.brandClient = prisma.brand;
exports.cameraClient = prisma.camera;
exports.bannerClient = prisma.banner;
exports.userClient = prisma.user;
exports.BookingClient = prisma.booking;
exports.default = prisma;
//# sourceMappingURL=prisma.js.map