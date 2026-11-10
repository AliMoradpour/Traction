import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMonthPlanDto {
  @ApiPropertyOptional({ type: [String], example: ['Finish the IELTS writing course'] })
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @IsOptional()
  focuses?: string[];

  @ApiPropertyOptional({ example: 'Keep evenings free on Fridays.' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  note?: string | null;
}

export interface MonthPlanResponse {
  month: string;
  focuses: string[];
  note: string | null;
  updatedAt: Date | null;
}
