import { Niche, Theme, DurationUnit, AppointmentStatus } from './enums';

export interface OnboardingStage1Dto {
  firstName: string;
  lastName: string;
  companyName?: string;
  slug: string;
  country: string;
  phoneNumber?: string;
  niche: Niche;
}

export interface OnboardingStage2Dto {
  avatarUrl?: string;
  coverImageUrl?: string;
}

export interface OnboardingStage3Dto {
  description?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  hasLocation: boolean;
  locationText?: string;
}

export interface OnboardingStage4Dto {
  theme: Theme;
}

export interface ServiceDto {
  id: string;
  name: string;
  price: number;
  currency?: string;
  locationText?: string;
  notes?: string;
  description?: string;
  durationValue: number;
  durationUnit: DurationUnit;
  iconKey?: Niche;
}

export interface ClientDto {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  notes?: string;
  lastAppointment?: string;
  bookingsCount?: number;
}

export interface AppointmentDto {
  id: string;
  serviceId: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientNotes?: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
}
