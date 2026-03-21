export type CommissionType = 'FLOWING_SAND' | 'SCREENSHOT';

export interface Step {
  label: string;
  sub: string;
}

export interface AdminUser {
  name: string;
  ownerId: string;
}

export interface Commission {
  id: string; // Database ID
  clientId: string; // Internal ID
  clientName: string;
  type: CommissionType;
  status: number;
  note: string; // Admin's public note
  ownerId: string;
  ownerName: string;
  updatedAt: number;
  createdAt?: number; // Creation timestamp
  deadline?: string; // YYYY-MM-DD
  // New fields for requests
  contactInfo?: string; 
  description?: string;
  price?: number;
  productionNote?: string; // Admin's private production note
  deliveryUrl?: string; // Google Drive link for delivery
}

export interface CommissionFormData {
  clientId?: string; // Optional for public requests (auto-generated)
  clientName: string;
  type: CommissionType;
  status: number;
  note: string;
  deadline?: string; // YYYY-MM-DD
  // New fields
  ownerId?: string; // Target artist ID
  contactInfo?: string;
  description?: string;
  price?: number;
  productionNote?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: number;
}

export interface ProductGallery {
  productId: string; // e.g., 'S_RAW', 'FLOWING_SAND_CARD'
  images: GalleryImage[];
}

export interface AppSettings {
  isAcceptingCommissions: boolean;
}

// Global variable declarations for the injected environment variables
declare global {
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;

  interface Window {
    __app_id?: string;
    __initial_auth_token?: string;
  }

  interface ImportMetaEnv {
    readonly VITE_TELEGRAM_BOT_TOKEN: string;
    readonly VITE_TELEGRAM_CHAT_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}