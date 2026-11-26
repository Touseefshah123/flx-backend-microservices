import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionService } from '../../common/services/transaction-manager.service';
import { UserEntity } from '../../database/entities/users.entity';
import { OutboxWriter } from '../../messaging/services/outbox-writer.service';
import { AuthController } from './auth.controller';
import { JwksController } from './jwks.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController, JwksController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    TransactionService,
    OutboxWriter,
  ],
})
export class AuthModule {}
