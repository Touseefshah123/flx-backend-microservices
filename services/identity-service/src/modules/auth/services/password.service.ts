import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PasswordPort } from '../interfaces/password.interface';

@Injectable()
export class PasswordService implements PasswordPort {
  private static readonly OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  };

  hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, PasswordService.OPTIONS);
  }

  async verify(hash: string | null, plainPassword: string): Promise<boolean> {
    // Hash anyway so an unknown email costs the same time as a wrong password.
    if (!hash) {
      await argon2.hash(plainPassword, PasswordService.OPTIONS);
      return false;
    }
    return argon2.verify(hash, plainPassword);
  }
}
