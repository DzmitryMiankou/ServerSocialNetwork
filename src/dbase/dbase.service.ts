import { Injectable } from '@nestjs/common';
import { ReturnDbaseType } from './dbase.interface';

@Injectable()
export class DbaseService {
  test(): ReturnDbaseType {
    return { test: 'Hi' };
  }
}
