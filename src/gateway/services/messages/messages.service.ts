import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/gateway/entity/messages.entity';
import {
  Message,
  MessagesType,
} from 'src/gateway/interfaces/chat.gateway.interface';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  async findMessages(id: number): Promise<Readonly<MessagesType[]>> {
    const messagesRaw = await this.messagesRepository.find({
      where: [{ sourceId: id }, { targetId: id }],
      relations: { target: true },
    });

    return this.fillterMessages(messagesRaw);
  }

  async saveMessage(message: Message): Promise<void> {
    await this.messagesRepository.save({
      sourceId: message.sourceId,
      targetId: message.targetId,
      message: message.message,
      createdAt: message.createdAt,
    });
  }

  private fillterMessages(
    messagesRaw: MessagesType[],
  ): Readonly<MessagesType[]> {
    const messages: Readonly<MessagesType[]> = messagesRaw.map((el) => {
      for (const del in el.target)
        if (
          del === 'password' ||
          del === 'isActive' ||
          del === 'socketId' ||
          del === 'activeId'
        )
          delete el.target[del];

      return { ...el, target: { ...el.target } };
    });
    return messages;
  }
}
