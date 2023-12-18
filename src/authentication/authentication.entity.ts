import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';

@Entity()
export class User {
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
}
