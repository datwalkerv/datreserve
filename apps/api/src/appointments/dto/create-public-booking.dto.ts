import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsDateString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePublicBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  clientName: string;

  @IsString()
  serviceId: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) => value?.trim() || undefined)
  clientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[+\d\s\-().]{7,30}$/, { message: 'clientPhone must be a valid phone number' })
  @Transform(({ value }) => value?.trim() || undefined)
  clientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim() || undefined)
  clientNotes?: string;
}
