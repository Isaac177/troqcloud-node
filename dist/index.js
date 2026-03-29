"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
const PORT = Number.parseInt(process.env.PORT ?? "8080", 10);
const SERVICE_NAME = "node-hello";
const SERVICE_VERSION = "1.0.0";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Set it in your environment.");
}
const DATABASE_URL = databaseUrl;
app.use(express_1.default.json());
const seedUsers = [
    { name: "Alice Doe", email: "alice@example.com" },
    { name: "Bob Stone", email: "bob@example.com" },
    { name: "Charlie Brook", email: "charlie@example.com" },
];
async function testDatabaseConnection() {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch {
        return false;
    }
}
async function bootstrapDatabase() {
    for (const user of seedUsers) {
        await prisma_1.prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name },
            create: user,
        });
    }
}
app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
    });
});
app.get("/about", async (_req, res) => {
    const databaseReachable = await testDatabaseConnection();
    res.json({
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        orm: "Prisma",
        databaseReachable,
    });
});
app.get("/health", (_req, res) => {
    res.json({ healthy: true });
});
app.get("/ready", async (_req, res) => {
    const databaseReachable = await testDatabaseConnection();
    res.status(databaseReachable ? 200 : 503).json({
        status: databaseReachable ? "ok" : "degraded",
        databaseReachable,
    });
});
app.get("/users", async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        orderBy: { id: "asc" },
    });
    res.json({ count: users.length, users });
});
app.get("/users/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "id must be a positive integer" });
        return;
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
    }
    res.json(user);
});
app.post("/users", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ error: "name and email are required" });
        return;
    }
    try {
        const user = await prisma_1.prisma.user.create({
            data: { name, email },
        });
        res.status(201).json(user);
    }
    catch {
        res.status(409).json({ error: "email already exists or payload is invalid" });
    }
});
async function start() {
    const dbHost = new URL(DATABASE_URL).host;
    const dbProtocol = new URL(DATABASE_URL).protocol.replace(":", "");
    console.log(`[startup] service=${SERVICE_NAME} version=${SERVICE_VERSION}`);
    console.log(`[startup] port=${PORT}`);
    console.log(`[startup] orm=prisma`);
    console.log(`[startup] database protocol=${dbProtocol} host=${dbHost}`);
    await prisma_1.prisma.$connect();
    console.log("[startup] prisma connected successfully");
    await bootstrapDatabase();
    console.log(`[startup] seeded ${seedUsers.length} users`);
    app.listen(PORT, () => {
        console.log(`[startup] ${SERVICE_NAME} listening on port ${PORT}`);
    });
}
void start().catch(async (error) => {
    console.error("[startup] failed to start app", error);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
async function shutdown(signal) {
    console.log(`[shutdown] received ${signal}`);
    await prisma_1.prisma.$disconnect();
    console.log("[shutdown] prisma disconnected");
    process.exit(0);
}
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
