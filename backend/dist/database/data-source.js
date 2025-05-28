"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const _1700000000000_CreateInitialSchema_1 = require("./migrations/1700000000000-CreateInitialSchema");
const _1700000000001_CreateInitialData_1 = require("./migrations/1700000000001-CreateInitialData");
const _1700000000002_CreateSampleData_1 = require("./migrations/1700000000002-CreateSampleData");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "pspc",
    password: process.env.DB_PASS || "pspc",
    database: process.env.DB_NAME || "postgres",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: ["src/entities/**/*.ts"],
    migrations: [
        _1700000000000_CreateInitialSchema_1.CreateInitialSchema1700000000000,
        _1700000000001_CreateInitialData_1.CreateInitialData1700000000001,
        _1700000000002_CreateSampleData_1.CreateSampleData1700000000002
    ],
    subscribers: ["src/subscribers/**/*.ts"],
});
