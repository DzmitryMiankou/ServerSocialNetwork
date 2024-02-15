export interface LeftJoinType {
  targets_id: number;
  targets_firstName: string;
  targets_lastName: string;
  targets_email: string;
  targets_password: string;
  targets_isActive: 0 | 1;
  targets_activeId: string;
  targets_socketId: string | null;
  sources_id: number;
  sources_firstName: string;
  sources_lastName: string;
  sources_email: string;
  sources_password: string;
  sources_isActive: 0 | 1;
  sources_activeId: string;
  sources_socketId: null | string;
  targetId: number;
  sourceId: number;
  createdAt: Date;
}

type TargetAndSource = {
  firstName: string;
  lastName: string;
};

export interface Message {
  createdAt: Date;
  sourceId: number;
  message: string;
  targetId: number;
  pathImg?: null | string;
  target: TargetAndSource;
  sources: TargetAndSource;
}

export type DialoguesType = Omit<Message, 'pathImg' | 'message'>;
type TargSourType = Omit<Message, 'target' | 'sources'>;

export interface MessagesType extends TargSourType {
  id: number;
  updatedAt: null | Date;
  target: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type TokenType = { sub: number; username: string };
