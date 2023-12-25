import { ConfigModule, ConfigService } from '@nestjs/config';

export const config = {
  imports: [ConfigModule],
  useFactory: () => ({
    global: true,
  }),
  inject: [ConfigService],
};

export const cookiesParams: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | 'lax' | 'strict' | 'none';
  maxAge: number;
} = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 2592000000,
};
