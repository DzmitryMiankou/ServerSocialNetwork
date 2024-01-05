export interface Message {
  timeSent: string;
  message: string;
}

export interface LeftJoinType {
  targets_id: number;
  targets_firstName: string;
  targets_lastName: string;
  targets_email: string;
  targets_password: string;
  targets_isActive: number;
  targets_activeId: string;
  targets_socketId: string | null;
  targetId: number;
  sourceId: number;
}

export interface MessagesType {
  id: number;
  targetId: number;
  sourceId: number;
  message: string;
  pathImg: null | string;
  createdAt: string;
  updatedAt: null | string;
  target: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    activeId: string;
  };
}

export interface DialoguesType {
  targetId: number;
  sourceId: number;
  firstName: string;
  lastName: string;
  activeId: string;
}
