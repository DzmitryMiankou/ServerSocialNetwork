import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/authentication/authentication.entity';
import { UserData } from 'src/interfaces/user-interface/user-interface';
import { Like, Repository } from 'typeorm';

@Injectable()
export class SearchUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositorty: Repository<User>,
  ) {}
  async searchUsers(str: string): Promise<UserData[]> {
    try {
      const loadedPosts = await this.userRepositorty.find({
        select: [`id`, `firstName`, `lastName`],
        where: [
          { isActive: true, firstName: Like(`%${str}%`) },
          { isActive: true, lastName: Like(`%${str}%`) },
        ],
      });
      return loadedPosts;
    } catch (error) {
      throw new BadRequestException(error.sqlMessage);
    }
  }
}
