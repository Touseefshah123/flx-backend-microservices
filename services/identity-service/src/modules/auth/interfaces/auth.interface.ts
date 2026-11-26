import { LoginDto } from '../dtos/login.dto';
import { SignupDto } from '../dtos/signup.dto';

export interface AuthResult {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthPort {
  signUp(dto: SignupDto): Promise<AuthResult>;
  login(dto: LoginDto): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<AuthResult>;
  logout(refreshToken: string | undefined): Promise<void>;
}
