import { EntityManager } from 'typeorm';

import { OutboxStatus } from '../../database/enums/outbox.enum';

export interface OutboxEventResult {
  id: string;
  eventType: string;
  aggregateId: string;
  status: OutboxStatus;
  createdAt: Date;
}

export interface OutboxWriterPort {
  write(
    manager: EntityManager,
    eventType: string,
    aggregateId: string,
    payload: Record<string, unknown>,
  ): Promise<OutboxEventResult>;
}
