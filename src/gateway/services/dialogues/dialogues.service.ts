import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/gateway/entity/messages.entity';
import {
  DialoguesType,
  LeftJoinType,
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
      .select(['targetId', 'sourceId', 'createdAt'])
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

  private fillterDialogues(dialoguesRaw: LeftJoinType[]): DialoguesType[] {
    const dialogues: DialoguesType[] = dialoguesRaw.map((obj) => {
      return {
        targetId: obj.targetId,
        sourceId: obj.sourceId,
        createdAt: obj.createdAt,
        target: {
          firstName: obj.targets_firstName,
          lastName: obj.targets_lastName,
        },
        sources: {
          firstName: obj.sources_firstName,
          lastName: obj.sources_lastName,
        },
      };
    });

    const newDialogues = {};
    const filterDialogues = dialogues.filter(
      ({ targetId, sourceId }) =>
        !newDialogues[targetId] && (newDialogues[targetId] = sourceId),
    );

    const arr: typeof dialogues = [];
    let unique: DialoguesType = filterDialogues[0];
    for (const i in filterDialogues) {
      !arr[0] && arr.push(filterDialogues[0]);
      if (filterDialogues[+i + 1]?.targetId !== unique.sourceId)
        if (filterDialogues[+i + 1]) {
          unique = filterDialogues[+i + 1];
          arr.push(filterDialogues[+i + 1]);
        }
    }
    return arr;
  }
}
