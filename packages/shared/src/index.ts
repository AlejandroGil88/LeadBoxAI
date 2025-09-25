export type LeadStatus =
  | 'Nuevo'
  | 'Contactado'
  | 'Cualificado'
  | 'En proceso'
  | 'Ganado'
  | 'Perdido';

export type ConversationChannel = 'whatsapp' | 'email' | 'sms' | 'telegram';

export interface Lead {
  id: string;
  contactId: string;
  ownerId?: string;
  source?: string;
  campaignId?: string;
  status: LeadStatus;
  score?: number;
  tags: string[];
}

export interface CampaignStats {
  delivered: number;
  read: number;
  replied: number;
  converted: number;
}
