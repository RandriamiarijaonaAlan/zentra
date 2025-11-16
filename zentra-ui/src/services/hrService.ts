import { get } from './api';

export type HRIndicators = {
  totalEmployees: number;
  employeesByGender: Record<string, number>;
  averageAge: number;
  averageSeniority: number;
  turnoverRate: number;
  absenteeismRate: number;
  contractEndingSoon: Array<any>;
  unclaimedLeaves: Array<any>;
};

export async function getHrIndicators(): Promise<HRIndicators> {
  return await get('/hr/indicators');
}
