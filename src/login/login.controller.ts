import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';

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
        .cookie('refresh_token', data.refresh_token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 2592000000,
        })
        .json({ ...resData });
    }

    throw new BadRequestException(data);
  }

  @UseGuards(AuthGuard)
  @Get(`allUsers/:users`)
  async searchUsers(@Param(`users`) user: string, @Res() response: Response) {
    const users = await this.loginService.searchUsers(user.replace(`:`, ''));
    if (user.replace(`:`, '') === '')
      return response.status(200).json(undefined);
    return response.status(200).json(users);
  }

  @Get(`refreshToken`)
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const newToken = await this.loginService.updateRefreshToken(
      request.cookies.refresh_token as string,
      request.cookies.refresh_token as string,
    );
    return response.status(201).json({ access_token: newToken });
  }
}
