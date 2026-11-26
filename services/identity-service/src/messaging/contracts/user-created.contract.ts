// Routing key; matches only the `#` binding (notification.events).
export const USER_CREATED = 'user.created';

// Append-only: never remove, rename or retype a field; only add optional ones.
export type UserCreatedV1 = {
  userId: string;
  email: string;
  createdAt: string;
};
