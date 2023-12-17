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
    const data = await this.loginService.login({
      email: user?.email,
      password: user?.password,
    });

    if (`access_token` in data)
      return response
        .cookie('access_token', data.access_token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
        })
        .json(data);

    return response.status(401).json(data);
  }

  @Get(`allUsers/:users`)
  async searchUsers(@Param(`users`) user: string, @Res() response: Response) {
    const users = await this.loginService.searchUsers(user.replace(`:`, ''));
    if (user.replace(`:`, '') === '')
      return response.status(200).json(undefined);
    return response.status(200).json(users);
  }
}
