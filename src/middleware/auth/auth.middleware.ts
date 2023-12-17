import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
    /*if (req.cookies.access_token === undefined)
      return res.status(401).json('not token');*/
    // const token = await req.cookies.access_token;
    //console.log(token);

    next();
  }
}
