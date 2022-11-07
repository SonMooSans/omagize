import { RawAttachment } from '../MessageAPI';
import { Snowflake } from './common';
import { Member, User } from '.';
import { RawMessage } from '../MessageAPI';
import { toAttachmentUrl } from '../utils';
import { parseDate } from '../utils/common';

export type Message = {
  id: Snowflake;
  group: Snowflake;
  author: Member;
  content: string;
  attachments: Attachment[];
  timestamp: Date;
  orderId: number;
  mentions: User[];
};

export type Attachment = {
  name: string;
  id: Snowflake;
  message: Snowflake;
  size?: number;
  type?: string;
  url: string;
};

export function Message(raw: RawMessage): Message {
  return {
    ...raw,
    author: new Member(raw.author),
    attachments: raw.attachments?.map((a) => Attachment(a)),
    timestamp: parseDate(raw.timestamp),
    mentions: raw.mentions.map((m) => new User(m)),
  };
}

export function Attachment(raw: RawAttachment): Attachment {
  return {
    ...raw,
    url: toAttachmentUrl(raw.message, raw.id, raw.name),
  };
}
