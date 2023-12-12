import { Controller, Get, Res } from '@nestjs/common';
import { LoginService } from './login.service';
import { Response } from 'express';

@Controller('app')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Get(`login`)
  async loginUsers(@Res() response: Response) {
    const dsg = await this.loginService.login('gmiankou@gmail.com');
    return response.status(200).json(dsg);
  }
}
