import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Contacts } from 'src/contacts/contacts.entity/contacts.entity';
import { Messages } from 'src/gateway/entity/messages.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @MinLength(2)
  @IsString()
  @Column({
    length: 100,
  })
  firstName: string;

  @MinLength(2)
  @IsString()
  @Column({
    length: 100,
  })
  lastName: string;

  @IsEmail()
  @Column({ unique: true, length: 100 })
  email: string;

  @MinLength(8)
  @IsString()
  @Column({
    length: 60,
  })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column()
  activeId: string;

  @Column({
    length: 60,
    default: null,
  })
  socketId: string;

  @OneToMany(() => Contacts, (photo) => photo.contact)
  contacts: Contacts[];

  @OneToMany(() => Messages, (photo) => photo.target)
  targets: Messages[];

  @OneToMany(() => Messages, (photo) => photo.source)
  sources: Messages[];
}
