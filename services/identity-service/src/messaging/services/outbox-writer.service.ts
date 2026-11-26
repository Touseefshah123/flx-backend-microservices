import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { OutboxEventEntity } from '../../database/entities/outbox-event.entity';
import {
  OutboxEventResult,
  OutboxWriterPort,
} from '../interfaces/outbox-writer.interface';
import { toOutboxEventResult } from '../mappers/outbox-event-result.mapper';

// The one place a business-code outbox_event row gets built, so every
// producer shapes it the same way.
@Injectable()
export class OutboxWriter implements OutboxWriterPort {
  async write(
    manager: EntityManager,
    eventType: string,
    aggregateId: string,
    payload: Record<string, unknown>,
  ): Promise<OutboxEventResult> {
    const saved = await manager.save(
      manager.create(OutboxEventEntity, { eventType, aggregateId, payload }),
    );
    return toOutboxEventResult(saved);
  }
}
