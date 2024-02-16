import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/gateway/entity/messages.entity';
import {
  DialoguesType,
  LeftJoinType,
  Message,
} from 'src/gateway/interfaces/chat.gateway.interface';
import { Repository } from 'typeorm';

@Injectable()
export class DialoguesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  async getDialogues(id: number): Promise<DialoguesType[]> {
    const dialoguesRaw: LeftJoinType[] = await this.messagesRepository
      .createQueryBuilder('messages')
      .select(['targetId', 'sourceId', 'createdAt', 'message'])
      .leftJoinAndSelect('messages.target', 'targets')
      .leftJoinAndSelect('messages.source', 'sources')
      .where('messages.sourceId = :sourceId OR messages.targetId = :targetId', {
        sourceId: id,
        targetId: id,
      })
      .orderBy('messages.id', 'DESC')
      .getRawMany();
    return this.fillterDialogues(dialoguesRaw);
  }

  sendDialogues(message: Message): DialoguesType {
    return this.modelDialogue(message);
  }

  private modelDialogue(message: Message | LeftJoinType): DialoguesType {
    return {
      sourceId: message.sourceId,
      targetId: message.targetId,
      createdAt: message.createdAt,
      message: message.message,
      target:
        'target' in message
          ? {
              firstName: message.target.firstName,
              lastName: message.target.lastName,
            }
          : {
              firstName: message.targets_firstName,
              lastName: message.targets_lastName,
            },
      sources:
        'target' in message
          ? {
              firstName: message.sources.firstName,
              lastName: message.sources.lastName,
            }
          : {
              firstName: message.sources_firstName,
              lastName: message.sources_lastName,
            },
    };
  }

  private fillterDialogues(dialoguesRaw: LeftJoinType[]): DialoguesType[] {
    const dialogues: DialoguesType[] = dialoguesRaw.map((obj) => {
      return this.modelDialogue(obj);
    });

    const newDialogues = {};
    const filterDialogues: typeof dialogues = dialogues
      .filter(
        ({ targetId, sourceId }) =>
          !newDialogues[targetId] && (newDialogues[targetId] = sourceId),
      )
      .reduce((o, i) => {
        !o.find((v) => v.sourceId === i.targetId) && o.push(i);
        return o;
      }, []);

    return filterDialogues;
  }
}
