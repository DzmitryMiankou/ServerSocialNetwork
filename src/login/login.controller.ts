import { Body, Controller, Post, Res, Get, Param } from '@nestjs/common';
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
    const login = await this.loginService.login({
      email: user?.email,
      password: user?.password,
    });
    return response.status(200).json(login);
  }

  @Get(`allUsers/:users`)
  async searchUsers(@Param(`users`) user: string, @Res() response: Response) {
    const users = await this.loginService.searchUsers(user.replace(`:`, ''));
    return response.status(200).json(users);
  }
}
