import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginEntity } from 'src/login/entities/login.entity/login.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @MinLength(2)
  @IsString()
  @Column()
  firstName: string;

  @MinLength(2)
  @IsString()
  @Column()
  lastName: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @MinLength(8)
  @IsString()
  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column()
  activeId: string;

  @OneToOne(() => LoginEntity)
  @JoinColumn()
  loginid: LoginEntity;
}
