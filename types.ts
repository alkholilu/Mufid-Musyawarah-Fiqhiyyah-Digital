// Types for Mufid Bahtsul Masail

export interface ArabicCitation {
  id: string;
  kitab: string;
  arabicText: string;
  translation: string;
  namaKitab?: string;
  juzKe?: string;
  halamanBerapa?: string;
  karanganSiapa?: string;
  statusHukum?: string;
  excludedFromPdf?: boolean;
}

export interface GroupResponse {
  groupId: string;
  groupName: string;
  text: string;
  citations: ArabicCitation[];
  status: 'Draft' | 'Revisi' | 'Disetor' | 'Disahkan';
  isReferensiUtama: boolean;
  evaluationNote: string;
}

export interface Question {
  id: string;
  title: string;
  status: string;
  categories: string[];
  year: number;
  waqiIyyah: string;
  asilah: string;
  finalFatwa?: string;
  responses?: GroupResponse[];
  arabicCitations?: ArabicCitation[];
  createdAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: 'UPDATE' | 'STATUS' | 'INSERT' | 'DELETE' | 'OVERRIDE';
  detail: string;
}

export type UserRole = 'Admin' | 'Mubahhisin' | 'Muharrir' | 'Mushohih';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  group: string;
  password?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  uploadedAt: string;
  size: string;
  path: string;
  headline?: string;
  tagline?: string;
  tanggalMasehi?: string;
  tahunSidang?: number;
  kategoriMasalah?: string;
  fileObject?: File;
}
