import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Response, Request } from 'express';
import { UserService } from './user.service';

@Controller('app')
export class UserController {
  constructor(private userServise: UserService) {}

  @UseGuards(AuthGuard)
  @Get(`user`)
  async searchUsers(@Req() req: Request, @Res() response: Response) {
    const token = req.headers.authorization.replace('Bearer=', '') as string;
    const user = await this.userServise.userData(token);
    return response.status(200).json(user[0]);
  }
}
