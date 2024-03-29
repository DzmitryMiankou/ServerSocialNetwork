import { User } from 'src/authentication/authentication.entity';

export interface RoomI {
  readonly id?: number;
  name?: string;
  users?: User[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
