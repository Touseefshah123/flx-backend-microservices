import { randomUUID } from 'crypto';

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../../../common/exceptions/app.exception';
import { TransactionService } from '../../../common/services/transaction-manager.service';
import { UserEntity } from '../../../database/entities/users.entity';
import { USER_CREATED } from '../../../messaging/contracts/user-created.contract';
import { toUserCreated } from '../../../messaging/mappers/user-created.mapper';
import { OutboxWriter } from '../../../messaging/services/outbox-writer.service';
import { LoginDto } from '../dtos/login.dto';
import { SignupDto } from '../dtos/signup.dto';
import { AuthPort, AuthResult } from '../interfaces/auth.interface';
import { RefreshTokenClaims } from '../interfaces/token.interface';
import { toAuthResult } from '../mappers/auth.mapper';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService implements AuthPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly tx: TransactionService,
    private readonly outboxWriter: OutboxWriter,
  ) {}

  async signUp(dto: SignupDto): Promise<AuthResult> {
    const { email, password } = dto;
    const existing = await this.userRepository.findOne({
      select: { id: true },
      where: { email },
    });
    if (existing) {
      throw new AppException(
        'EMAIL_ALREADY_EXISTS',
        'Email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await this.passwordService.hash(password);

    const user = await this.tx.run(async (manager) => {
      const saved = await manager.save(
        manager.create(UserEntity, {
          userId: randomUUID(),
          email,
          passwordHash,
        }),
      );
      await this.outboxWriter.write(
        manager,
        USER_CREATED,
        saved.userId,
        toUserCreated(saved),
      );
      return saved;
    });

    // Signed after commit: tokens are stateless, so nothing here needs the transaction.
    const tokens = await this.tokenService.issueTokens(user);
    return toAuthResult(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        userId: true,
        email: true,
        passwordHash: true,
        tokenVersion: true,
        disabledAt: true,
      },
      where: { email },
    });

    const isValid = await this.passwordService.verify(
      user?.passwordHash ?? null,
      password,
    );
    if (!user || !isValid) {
      throw new AppException(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.disabledAt) {
      throw new AppException(
        'ACCOUNT_DISABLED',
        'This account is disabled',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokens = await this.tokenService.issueTokens(user);
    return toAuthResult(user, tokens);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const claims = await this.tokenService.verifyRefreshToken(refreshToken);

    // The one read that makes ban, password change and logout-all reach refresh.
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        userId: true,
        email: true,
        tokenVersion: true,
        disabledAt: true,
      },
      where: { userId: claims.sub },
    });

    if (!user || user.disabledAt) {
      throw new AppException(
        'ACCOUNT_DISABLED',
        'This account is disabled',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.tokenVersion !== claims.tv) {
      throw new AppException(
        'REFRESH_TOKEN_REVOKED',
        'Refresh token has been revoked',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokens = await this.tokenService.issueTokens(user);
    return toAuthResult(user, tokens);
  }

  // Ends every session: bumping tokenVersion rejects all refresh tokens issued before now.
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    let claims: RefreshTokenClaims;
    try {
      claims = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      // Expired or invalid: nothing to revoke, and logout must still clear the cookie.
      return;
    }

    // Matching tv too, so an already-revoked token cannot keep bumping the counter.
    await this.userRepository.increment(
      { userId: claims.sub, tokenVersion: claims.tv },
      'tokenVersion',
      1,
    );
  }
}
