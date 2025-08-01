import { Module } from '@nestjs/common';
import { TypeormService } from './typeorm.service';
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { CommonModule, CommonService } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Module({})
export class TypeormModule {
  static register(entities: any[]) {
    return {
      module: TypeormModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [CommonModule],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            const host = configService.get("database.host");
            const port = configService.get("database.port");
            const username = configService.get("database.username");
            const password = configService.get("database.password");
            const database = configService.get("database.database");
            return {
              type: "mysql",
              connectorPackage: "mysql2",
              host,
              port,
              username,
              password,
              database,
              entities,
              synchronize: true,
              logging: false,
              poolSize: 10
            };
          },
          inject: [ConfigService]
        })
      ],
      providers: [TypeormService],
      exports: [TypeormService],
    }
  }
}
