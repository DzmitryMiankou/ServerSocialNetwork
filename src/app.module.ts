import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DbaseModule } from './dbase/dbase.module';
import { UserEntity } from './dbase/entities/user.entity/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get(`MAIL_HOST`),
          port: +configService.get(`MAIL_PORT`),
          ignoreTLS: false,
          secure: false,
          auth: {
            user: configService.get(`MAIL_USER`),
            pass: configService.get(`MAIL_PASSWORD`),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get(`MAIL_FROM`)}>`,
        },
        preview: true,
        template: {
          dir: join(__dirname, `views/email`),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
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
