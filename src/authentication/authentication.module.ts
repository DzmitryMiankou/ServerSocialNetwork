import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { User } from './authentication.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LoginEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(`SECRET_REFRESH_KEY`),
        signOptions: { expiresIn: '30d' },
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
          dir: join(__dirname, `/email/templates`),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
