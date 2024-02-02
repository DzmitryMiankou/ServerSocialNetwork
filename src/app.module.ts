import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './authentication/authentication.entity';
import { LoginModule } from './login/login.module';
import { Login } from './login/entities/login.entity/login.entity';
import { GatewayModule } from './gateway/gateway.module';
import { AuthMiddleware } from './middleware/auth/auth.middleware';
import { AuthenticationModule } from './authentication/authentication.module';
import { SearchUserModule } from './search-user/search-user.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ContactsModule } from './contacts/contacts.module';
import { Contacts } from './contacts/contacts.entity/contacts.entity';
import { Messages } from './gateway/entity/messages.entity';
import { Room } from './gateway/entity/room.entity';
import { JoinedRoom } from './gateway/entity/joined-room.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: +configService.get<number>(`REDIS_TTL`),
        store: redisStore,
        host: configService.get<string>(`REDIS_HOST`),
        port: configService.get<string>(`REDIS_PORT`),
      }),
      inject: [ConfigService],
    }),
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
        entities: [User, Login, Contacts, Messages, Room, JoinedRoom],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    LoginModule,
    GatewayModule,
    AuthenticationModule,
    SearchUserModule,
    UserModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'app/allUsers/*', method: RequestMethod.GET });
  }
}
