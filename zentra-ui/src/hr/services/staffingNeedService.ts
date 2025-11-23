import type { StaffingNeed } from '../types/StaffingNeed';
import { get, post, put, del } from './api.ts';

export const staffingNeedService = {
  // Obtenir tous les besoins
  async getAllStaffingNeeds(): Promise<StaffingNeed[]> {
    return await get<StaffingNeed[]>('/staffing-needs');
  },

  // Obtenir un besoin par ID
  async getStaffingNeedById(id: number): Promise<StaffingNeed> {
    return await get<StaffingNeed>(`/staffing-needs/${id}`);
  },

  // Créer un nouveau besoin
  async createStaffingNeed(staffingNeed: StaffingNeed): Promise<StaffingNeed> {
    return await post<StaffingNeed>('/staffing-needs', staffingNeed);
  },

  // Mettre à jour un besoin
  async updateStaffingNeed(id: number, staffingNeed: StaffingNeed): Promise<StaffingNeed> {
    return await put<StaffingNeed>(`/staffing-needs/${id}`, staffingNeed);
  },

  // Supprimer un besoin
  async deleteStaffingNeed(id: number): Promise<void> {
    return await del<void>(`/staffing-needs/${id}`);
  },

  // Filtrer par statut
  async getByStatus(status: string): Promise<StaffingNeed[]> {
    return await get<StaffingNeed[]>(`/staffing-needs/status/${encodeURIComponent(status)}`);
  },

  // Filtrer par priorité
  async getByPriority(priority: string): Promise<StaffingNeed[]> {
    return await get<StaffingNeed[]>(`/staffing-needs/priority/${encodeURIComponent(priority)}`);
  },

  // Filtrer par département
  async getByDepartment(departmentId: number): Promise<StaffingNeed[]> {
    return await get<StaffingNeed[]>(`/staffing-needs/department/${departmentId}`);
  },
};
