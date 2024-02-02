import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { JoinedRoom } from 'src/gateway/entity/joined-room.entity';
import { Repository } from 'typeorm';
import { RoomI } from 'src/gateway/interfaces/room.interfaces';
import { User } from 'src/authentication/authentication.entity';

interface JoinedRoomI {
  readonly id?: number;
  socketId: string;
  user: User;
  room: RoomI;
}

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoom)
    private readonly joinedRoomRepository: Repository<JoinedRoom>,
  ) {}

  async create(joinedRoom: JoinedRoomI) {
    return await this.joinedRoomRepository.save(joinedRoom);
  }

  async findByUser(user: User) {
    return await this.joinedRoomRepository.find({ where: { id: user.id } });
  }

  async findByRoom(room: RoomI) {
    return await this.joinedRoomRepository.find({ where: { id: room.id } });
  }

  async deleteBySocketId(socketId: string) {
    await this.joinedRoomRepository.delete({ socketId });
  }

  async deleteAll(): Promise<void> {
    await this.joinedRoomRepository.createQueryBuilder().delete().execute();
  }
}
