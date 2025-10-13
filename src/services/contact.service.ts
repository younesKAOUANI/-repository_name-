export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  respondedAt?: string;
  respondedBy?: string;
}

export type ContactType = 'SUPPORT' | 'BILLING' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
export type ContactStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ContactFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  search?: string;
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
}

export interface UpdateContactData {
  status?: ContactStatus;
  adminNotes?: string;
}

class ContactService {
  private baseUrl = '/api/contacts';

  async createContact(data: CreateContactData): Promise<{ success: boolean; message: string; contactId?: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    return response.json();
  }

  async getContactById(id: string): Promise<{ success: boolean; data?: Contact; message?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async updateContact(id: string, data: UpdateContactData): Promise<{ success: boolean; message: string; data?: Contact }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async deleteContact(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    return response.json();
  }

  // Helper methods
  getContactTypeLabel(type: ContactType): string {
    const labels: Record<ContactType, string> = {
      SUPPORT: 'Support technique',
      BILLING: 'Facturation',
      FEATURE: 'Suggestion de fonctionnalité',
      PARTNERSHIP: 'Partenariat',
      OTHER: 'Autre'
    };
    return labels[type];
  }

  getContactStatusLabel(status: ContactStatus): string {
    const labels: Record<ContactStatus, string> = {
      PENDING: 'En attente',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé'
    };
    return labels[status];
  }

  getContactStatusColor(status: ContactStatus): string {
    const colors: Record<ContactStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  }
}

export const contactService = new ContactService();