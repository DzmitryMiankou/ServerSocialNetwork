import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/authentication/authentication.entity';

@Entity()
@Unique(['contactId', 'user'])
export class Contacts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contactId: number;

  @ManyToOne(() => User, (user) => user.contacts)
  user: User;
}
