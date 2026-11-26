import { UserEntity } from '../../database/entities/users.entity';
import { UserCreatedV1 } from '../contracts/user-created.contract';

export function toUserCreated(
  user: Pick<UserEntity, 'userId' | 'email'>,
): UserCreatedV1 {
  return {
    userId: user.userId,
    email: user.email,
    createdAt: new Date().toISOString(),
  };
}
