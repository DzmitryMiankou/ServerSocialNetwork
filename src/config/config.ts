import { ConfigModule, ConfigService } from '@nestjs/config';

export const config = {
  imports: [ConfigModule],
  useFactory: () => ({
    global: true,
  }),
  inject: [ConfigService],
};
