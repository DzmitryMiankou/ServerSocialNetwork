import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  userData(token: string) {
    console.log(token);
  }
}
