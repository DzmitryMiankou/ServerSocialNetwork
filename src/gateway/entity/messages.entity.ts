import { User } from 'src/authentication/authentication.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Messages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  targetId: number;

  @Column()
  sourceId: number;

  @Column({
    length: 255,
  })
  message: string;

  @Column({
    default: null,
    length: 100,
  })
  pathImg: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn({ default: null })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  target: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  source: User;
}
