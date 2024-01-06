export interface Message {
  createdAt: string;
  sourceId: number;
  message: string;
  targetId: number;
  pathImg?: null | string;
}

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
  createdAt: string;
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
  createdAt: string;
  target: { firstName: string; lastName: string; activeId: string };
  sources: {
    firstName: string;
    lastName: string;
    activeId: string;
  };
}
