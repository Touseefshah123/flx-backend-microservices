import { OutboxEventEntity } from '../../database/entities/outbox-event.entity';
import { OutboxEventResult } from '../interfaces/outbox-writer.interface';

export function toOutboxEventResult(
  entity: OutboxEventEntity,
): OutboxEventResult {
  return {
    id: entity.id,
    eventType: entity.eventType,
    aggregateId: entity.aggregateId,
    status: entity.status,
    createdAt: entity.createdAt,
  };
}
