import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/authentication/authentication.entity';
import { Room } from 'src/gateway/entity/room.entity';
import { RoomI } from 'src/gateway/interfaces/room.interfaces';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async createRoom(room: RoomI, creator: User): Promise<RoomI> {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  async getRoomsForUser(userId: number, options: IPaginationOptions) {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'user')
      .where('user.id = :userId', { userId });

    return paginate(query, options);
  }

  async addCreatorToRoom(room: RoomI, creator: User): Promise<RoomI> {
    room.users.push(creator);
    return room;
  }
}
