import { User } from 'src/authentication/authentication.entity';

export interface RoomI {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
}
