import { Controller, Get, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { Response } from 'express';

@Controller('app')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Get(`login`)
  async loginUsers(@Res() response: Response) {
    const dsg = await this.loginService.login({
      email: 'gmiankou@gmail.com',
      password: 'miankou14121994A',
    });
    return response.status(200).json(dsg);
  }
}
