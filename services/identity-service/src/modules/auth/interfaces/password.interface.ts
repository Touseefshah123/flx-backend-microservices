export interface PasswordPort {
  hash(plainPassword: string): Promise<string>;
  verify(hash: string | null, plainPassword: string): Promise<boolean>;
}
