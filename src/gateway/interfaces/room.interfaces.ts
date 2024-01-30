import { User } from 'src/authentication/authentication.entity';

export interface RoomI {
  readonly id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
}
