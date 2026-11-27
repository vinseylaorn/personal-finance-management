// ~/types/category.ts
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}
