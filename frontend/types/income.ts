export interface Income {
    id: number;
    source: string;
    categoryId: string | number; // <-- change here
    amount: number;
    createdBy: string;
    createdAt: string;

}
