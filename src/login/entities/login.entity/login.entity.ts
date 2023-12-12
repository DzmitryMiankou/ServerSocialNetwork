import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoginEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;
}
