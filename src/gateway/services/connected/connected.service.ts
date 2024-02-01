import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/authentication/authentication.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositort: Repository<User>,
  ) {}

  async saveSocketId(socketId: string, userId: number): Promise<void> {
    await this.userRepositort
      .createQueryBuilder()
      .update(`user`)
      .set({
        socketId: socketId,
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async findByUser(userId: number): Promise<User[]> {
    try {
      return await this.userRepositort.find({
        where: { id: userId },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteByIdSocket(socketId: string): Promise<void> {
    await this.userRepositort
      .createQueryBuilder()
      .update(`user`)
      .set({
        socketId: 'Disconnect',
      })
      .where('socketId = :socketId', { socketId: socketId })
      .execute();
  }
}
