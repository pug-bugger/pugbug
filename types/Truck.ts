// Custom Field Types
export enum CustomFieldType {
  DATE = 'DATE',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN'
}

export interface BaseCustomField<T extends CustomFieldType, V> {
  id: string;
  type: T;
  label: string;
  value: V;
}

// Specific custom field implementations
export interface DateCustomField extends BaseCustomField<CustomFieldType.DATE, Date | { seconds: number; nanoseconds: number } | null> {}
export interface TextCustomField extends BaseCustomField<CustomFieldType.TEXT, string> {}
export interface NumberCustomField extends BaseCustomField<CustomFieldType.NUMBER, number | null> {}
export interface BooleanCustomField extends BaseCustomField<CustomFieldType.BOOLEAN, boolean> {}

// Union type for all custom fields
export type CustomField = DateCustomField | TextCustomField | NumberCustomField | BooleanCustomField;

export interface Truck {
  id: string;
  name: string;
  note: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
  customFields: CustomField[];
}

export interface CreateTruckData {
  name: string;
  note: string;
  customFields: CustomField[];
}

export interface UpdateTruckData {
  name?: string;
  note?: string;
  customFields?: CustomField[];
} 

export const FIELD_TEMPLATES = [
  {
    label: "Insurance Deadline",
    type: CustomFieldType.DATE,
    icon: "📅",
  },
  {
    label: "Tech Inspection Deadline",
    type: CustomFieldType.DATE,
    icon: "🔧",
  },
  {
    label: "License Plate",
    type: CustomFieldType.TEXT,
    icon: "🚛",
  },
  {
    label: "Mileage",
    type: CustomFieldType.NUMBER,
    icon: "🔢",
  },
  {
    label: "Is Active",
    type: CustomFieldType.BOOLEAN,
    icon: "✅",
  },
];