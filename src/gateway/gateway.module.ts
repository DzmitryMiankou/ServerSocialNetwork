import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config/config';

@Module({
  imports: [JwtModule.registerAsync({ ...config })],
  providers: [GatewayService],
})
export class GatewayModule {}
