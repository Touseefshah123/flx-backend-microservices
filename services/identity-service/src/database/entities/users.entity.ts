import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { VerificationStatus } from '../enums/verificationStatus.enum';
import { userType } from '../enums/userType.enum';

@Entity({ schema: 'identity_flx', name: 'users' })
@Index('IDX_users_email', ['email'], { unique: true })
@Index('IDX_users_role', ['role'])
@Index('IDX_users_verificationStatus', ['verificationStatus'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar' })
  email: string;

  // select: false so no profile read ever carries the hash; login selects it explicitly.
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  // Bumped on ban, password change or logout-all; refresh rejects tokens carrying an older value.
  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  @Column({ type: 'timestamptz', nullable: true })
  disabledAt: Date | null;

  // Null until createProfile: signup only collects email and password.
  @Column({ type: 'varchar', nullable: true })
  fName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lName: string | null;

  // E.164 Saudi mobile (+9665XXXXXXXX); the SMS notifications go here.
  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'boolean', nullable: true })
  termsAccepted: boolean | null;

  @Column({ type: 'enum', enum: userType, nullable: true })
  type: userType | null;

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: UserEntity | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  // Only meaningful when verificationStatus = REJECTED.
  @Column({ type: 'varchar', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role: UserRole | null;

  @Column({ type: 'boolean', default: false })
  isProfileComplete: boolean;

  @Column({ type: 'int', default: 0 })
  onboardingStep: number;

  @Column({ type: 'varchar', nullable: true })
  onboardingType: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
