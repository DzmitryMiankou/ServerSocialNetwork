import { Injectable } from '@nestjs/common';
import { User } from 'src/authentication/authentication.entity';

interface RoomI {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updateAt: string;
  users: User[];
}
@Injectable()
export class RoomService {
  async createRoom(room: any, creator: User) {
    this.addCreatorToRoom(room, creator);
  }

  async getRoomsForUser(userId: number) {}

  async addCreatorToRoom(room: RoomI, creator: User) {
    room.users.push(creator);
    return room;
  }
}
