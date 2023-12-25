import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { Response, Request } from 'express';
import { cookiesParams } from 'src/config/config';

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

    if (`refresh_token` in data) {
      const resData = { ...data };
      delete resData['refresh_token'];
      return response
        .cookie('refresh_token', data.refresh_token, cookiesParams)
        .json({ ...resData });
    }

    throw new BadRequestException(data);
  }

  @Get(`refreshToken`)
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const newToken = await this.loginService.updateRefreshToken(
      request.cookies.refresh_token as string,
    );
    return response.status(201).json({ access_token: newToken });
  }

  @Get(`logOut`)
  async logOutUser(@Req() request: Request, @Res() response: Response) {
    await this.loginService.logOutUser(request.cookies.refresh_token as string);
    return response.clearCookie('refresh_token', cookiesParams).json('logout');
  }
}
