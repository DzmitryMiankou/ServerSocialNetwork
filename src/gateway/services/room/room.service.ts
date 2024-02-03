import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Room } from 'src/gateway/entity/room.entity';
import { RoomI } from 'src/gateway/interfaces/room.interfaces';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async createRoom(room: RoomI): Promise<RoomI> {
    return this.roomRepository.save(room);
  }

  async getRoom(roomId: number) {
    return await this.roomRepository.findOne({
      where: { id: roomId },
      relations: { users: true },
    });
  }

  async getRoomsForUser(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'user')
      .where('user.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_user')
      .orderBy('room.createdAt', 'DESC');

    return paginate(query, options);
  }
}
