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
    const socketIdUpdata = await this.userRepositort.findOneBy({
      id: userId,
    });
    socketIdUpdata.socketId = socketId;
    await this.userRepositort.save(socketIdUpdata);
  }

  async findByUser(userId: number): Promise<User[]> {
    return await this.userRepositort.find({
      where: { id: userId },
    });
  }

  async deleteByIdSocket(socketId: string): Promise<void> {
    try {
      await this.userRepositort
        .createQueryBuilder()
        .update(`user`)
        .set({
          socketId: null,
        })
        .where('socketId = :socketId', { socketId: socketId })
        .execute();
    } catch (error) {
      console.log(error);
    }
  }
}
