export interface Truck {
  id: string;
  name: string;
  note: string;
  insuranceDeadline: string | null;
  techInspectionDeadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTruckData {
  name: string;
  note: string;
  insuranceDeadline: string | null;
  techInspectionDeadline: string | null;
}

export interface UpdateTruckData {
  name?: string;
  note?: string;
  insuranceDeadline?: string | null;
  techInspectionDeadline?: string | null;
} 