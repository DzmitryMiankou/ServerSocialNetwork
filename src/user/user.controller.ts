import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Response, Request } from 'express';

@Controller('app')
export class UserController {
  @UseGuards(AuthGuard)
  @Get(`user`)
  async searchUsers(@Req() req: Request, @Res() response: Response) {
    console.log(req);
    response.status(200).json('ok');
  }
}
