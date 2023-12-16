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
import { LoginModule } from './login/login.module';
import { LoginEntity } from './login/entities/login.entity/login.entity';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>(`HOST_DB`),
        port: +configService.get<number>(`PORT_DB`),
        username: configService.get<string>(`USERNAME_DB`),
        password: configService.get<string>(`PASSWORD_DB`),
        database: configService.get<string>(`DATABASE_DB`),
        entities: [UserEntity, LoginEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>(`MAIL_HOST`),
          port: +configService.get<number>(`MAIL_PORT`),
          ignoreTLS: false,
          secure: false,
          auth: {
            user: configService.get<string>(`MAIL_USER`),
            pass: configService.get<string>(`MAIL_PASSWORD`),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>(`MAIL_FROM`)}>`,
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
    LoginModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
