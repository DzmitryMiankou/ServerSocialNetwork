import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Response } from 'express';
import { SearchUserService } from './search-user.service';

@Controller('app')
export class SearchUserController {
  constructor(private loginService: SearchUserService) {}

  @UseGuards(AuthGuard)
  @Get(`allUsers/:users`)
  async searchUsers(@Param(`users`) user: string, @Res() response: Response) {
    const users = await this.loginService.searchUsers(user.replace(`:`, ''));
    if (user.replace(`:`, '') === '')
      return response.status(200).json(undefined);
    return response.status(200).json(users);
  }
}
