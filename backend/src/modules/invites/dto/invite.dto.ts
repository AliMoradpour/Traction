import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateInviteDto {
  @ApiProperty({ example: 'friend@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.BETA_TESTER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  code: string;
}

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  usedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  usedBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export class InviteStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  used: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  expired: number;
}
