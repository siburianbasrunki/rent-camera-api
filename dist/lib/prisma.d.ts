import { PrismaClient } from "../generated/prisma";
declare global {
    var prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient<import("../generated/prisma").Prisma.PrismaClientOptions, never, import("generated/prisma/runtime/library").DefaultArgs>;
export declare const brandClient: import("../generated/prisma").Prisma.BrandDelegate<import("generated/prisma/runtime/library").DefaultArgs, import("../generated/prisma").Prisma.PrismaClientOptions>;
export declare const cameraClient: import("../generated/prisma").Prisma.CameraDelegate<import("generated/prisma/runtime/library").DefaultArgs, import("../generated/prisma").Prisma.PrismaClientOptions>;
export declare const bannerClient: import("../generated/prisma").Prisma.BannerDelegate<import("generated/prisma/runtime/library").DefaultArgs, import("../generated/prisma").Prisma.PrismaClientOptions>;
export declare const userClient: import("../generated/prisma").Prisma.UserDelegate<import("generated/prisma/runtime/library").DefaultArgs, import("../generated/prisma").Prisma.PrismaClientOptions>;
export declare const BookingClient: import("../generated/prisma").Prisma.BookingDelegate<import("generated/prisma/runtime/library").DefaultArgs, import("../generated/prisma").Prisma.PrismaClientOptions>;
export default prisma;
