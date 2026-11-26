import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { OutboxStatus } from '../enums/outbox.enum';

// Transactional outbox, written in the SAME transaction as the business
// write — an event cannot survive a rollback and cannot be lost after a
// commit. identity-svc is a producer only here: the ERD gives it no
// inbox_event table, so InboxEventEntity is deliberately not registered.
@Entity({ schema: 'identity_flx', name: 'outbox_event' })
@Index('IDX_identity_outbox_pending', ['status', 'createdAt'])
export class OutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // user.registered, user.role.changed, seller.verified
  @Column({ type: 'varchar', length: 120 })
  eventType: string;

  @Column({ type: 'uuid' })
  aggregateId: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'enum', enum: OutboxStatus, default: OutboxStatus.PENDING })
  status: OutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  // Per-row backoff after a failed publish — the relay skips a row until
  // this passes, instead of retrying it every tick.
  @Column({ type: 'timestamptz', nullable: true })
  nextAttemptAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
