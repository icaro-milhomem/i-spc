import { DataSource } from "typeorm";
import { CreateInitialSchema1700000000000 } from "./migrations/1700000000000-CreateInitialSchema";
import { CreateInitialData1700000000001 } from "./migrations/1700000000001-CreateInitialData";
import { CreateSampleData1700000000002 } from "./migrations/1700000000002-CreateSampleData";

export const AppDataSource = new DataSource({
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
        CreateInitialSchema1700000000000,
        CreateInitialData1700000000001,
        CreateSampleData1700000000002
    ],
    subscribers: ["src/subscribers/**/*.ts"],
}); 