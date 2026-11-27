export interface Expense {
    id: number;
    description: string;
    categoryId: string | number; // <-- change here
    amount: number;
    createdBy: string;
    createdAt: string;

}
