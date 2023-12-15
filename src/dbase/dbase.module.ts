import { Module } from '@nestjs/common';
import { DbaseController } from './dbase.controller';
import { DbaseService } from './dbase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, LoginEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(`SECRET_ACCESS_KEY`),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DbaseController],
  providers: [DbaseService],
})
export class DbaseModule {}
