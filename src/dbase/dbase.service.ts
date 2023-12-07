import { Injectable } from '@nestjs/common';
import { UserDataType } from './dbase.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DbaseService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly todoRepositort: Repository<UserEntity>,
  ) {}

  findOneById(id: number): Promise<UserDataType> {
    return this.todoRepositort.findOneBy({ id: id });
  }

  findAll(): Promise<UserDataType[]> {
    return this.todoRepositort.find();
  }
}
