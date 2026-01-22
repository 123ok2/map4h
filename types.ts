
export type HelpStatus = 'waiting' | 'assisting' | 'completed';

export type HelpType = 'Food' | 'Medical' | 'Rescue' | 'Other';

export interface HelpRequest {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  type: HelpType;
  requesterName?: string; // New field
  description: string;
  contact?: string;
  imageUrl?: string;
  status: HelpStatus;
  createdAt: any;
  // Định danh chống spam
  createdBy: string; 
  assistedBy?: string;
  // Thông tin người giúp đỡ
  helperName?: string;
  helperContact?: string;
  proofImageUrl?: string;
  completedAt?: any;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
