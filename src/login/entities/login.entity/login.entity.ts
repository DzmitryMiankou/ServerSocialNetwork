import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from 'src/dbase/entities/user.entity/user.entity';

@Entity()
export class LoginEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;

  @Column()
  userId: number;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity[];
}
