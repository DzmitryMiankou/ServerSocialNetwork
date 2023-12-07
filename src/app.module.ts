import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DbaseModule } from './dbase/dbase.module';
import { UserEntity } from './dbase/entities/user.entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get(`HOST_DB`),
        port: +configService.get(`PORT_DB`),
        username: configService.get(`USERNAME_DB`),
        password: configService.get(`PASSWORD_DB`),
        database: configService.get(`DATABASE_DB`),
        entities: [UserEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DbaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
