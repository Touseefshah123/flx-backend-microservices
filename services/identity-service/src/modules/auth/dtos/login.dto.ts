import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'buyer@flx.com' })
  // Same normalisation as signup, so the exact-match lookup finds the stored address.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'Test1234!' })
  @IsString()
  @MaxLength(128)
  password: string;
}
