import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { JoinedRoom } from 'src/gateway/entity/joined-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoom)
    private readonly joinedRoomRepository: Repository<JoinedRoom>,
  ) {}
}
