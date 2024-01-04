import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entity/messages.entity';

@Module({
  imports: [
    JwtModule.registerAsync({ ...config }),
    TypeOrmModule.forFeature([Messages]),
  ],
  providers: [GatewayService],
})
export class GatewayModule {}
