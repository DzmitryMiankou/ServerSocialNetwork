import { User } from 'src/authentication/authentication.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
    length: 300,
  })
  pathImg: string;

  @Column({
    length: 50,
  })
  createdAt: string;

  @Column({
    length: 50,
  })
  updatedAt: string;

  @ManyToOne(() => User, (user) => user.id)
  target: User;

  @ManyToOne(() => User, (user) => user.id)
  source: User;
}
