import { DataSource, DataSourceOptions } from "typeorm";
import { join } from "path";
import { LostPet } from "../entities/lost-pet.entity";
import { FoundPet } from "../entities/found-pet.entity";
import { envs } from "../../config/envs";

export const dataSourceOptions : DataSourceOptions = {
        type: 'postgres',
        host: envs.DB_HOST,
        port: envs.DB_PORT,
        username: envs.DB_USERNAME,
        password: envs.DB_PASSWORD,
        database: envs.DB_NAME,
        entities: [LostPet, FoundPet],
        synchronize: false,
        migrations: [join(__dirname, "migrations/*{.ts,.js}")],
};

export const dataSource = new DataSource(dataSourceOptions);
