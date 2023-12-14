import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { Response } from 'express';

@Controller('app')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post(`login`)
  async loginUsers(
    @Body() user: { email: string; password: string },
    @Res() response: Response,
  ) {
    const dsg = await this.loginService.login({
      email: user?.email,
      password: user?.password,
    });
    return response.status(200).json(dsg);
  }
}
