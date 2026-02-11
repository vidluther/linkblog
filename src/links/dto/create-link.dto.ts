import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;
}
