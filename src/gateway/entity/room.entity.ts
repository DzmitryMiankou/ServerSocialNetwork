import { User } from 'src/authentication/authentication.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinedRoom } from './joined-room.entity';
import { Messages } from './messages.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @OneToMany(() => JoinedRoom, (joinedRooms) => joinedRooms.room)
  joinedUsers: JoinedRoom[];

  @OneToMany(() => Messages, (joinedRooms) => joinedRooms.room)
  messages: Messages[];

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
