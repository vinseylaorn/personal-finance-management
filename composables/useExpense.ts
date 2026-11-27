import { ref } from "vue"
import { useUserStore } from "~/store/user"
import type { Expense } from "~/types/expense"
import type { Category } from "~/types/category"

export const useExpenseApi = () => {
    const expenses = ref<Expense[]>([])
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const userStore = useUserStore() // get logged-in user

    const getToken = () => (process.client ? localStorage.getItem("token") || "" : "")

    // --- Fetch all expenses ---
    const fetchExpenses = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await $fetch<any[]>("http://localhost:8000/api/expenses", {
                headers: { Authorization: `Bearer ${getToken()}` },
            })

            expenses.value = data.map((i) => ({
                id: i.id,
                description: i.description,
                categoryId: i.category_id,
                category: i.category?.name || "Unknown",
                amount: i.amount,
                createdBy: i.created_by,
                createdAt: i.created_at.split("T")[0],
            }))
        } catch (err: any) {
            error.value = err.message || "Failed to fetch expenses"
        } finally {
            loading.value = false
        }
    }

    // --- Fetch all categories ---
    const fetchCategories = async () => {
        try {
            const data = await $fetch<any>("http://localhost:8000/api/categories", {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            categories.value = Array.isArray(data) ? data : data.data
        } catch (err) {
            console.error("Failed to fetch categories:", err)
            categories.value = []
        }
    }

    // --- Add new expense ---
    const addExpense = async (expense: Partial<Expense>) => {
        try {
            const newExpense = await $fetch<any>("http://localhost:8000/api/expenses", {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: {
                    description: expense.description,
                    amount: expense.amount,
                    category_id: expense.categoryId,
                    created_by: userStore.user?.username || "Unknown",
                },
            })

            expenses.value.push({
                id: newExpense.id,
                description: newExpense.description,
                categoryId: newExpense.category_id,
                amount: newExpense.amount,
                createdBy: newExpense.created_by,
                createdAt: newExpense.created_at.split("T")[0],
            })
        } catch (err: any) {
            error.value = err.message || "Failed to add expense"
        }
    }

    // --- Update expense ---
    const updateExpense = async (expense: Expense) => {
        try {
            await $fetch(`http://localhost:8000/api/expenses/${expense.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: {
                    description: expense.description,
                    amount: expense.amount,
                    category_id: expense.categoryId,
                    created_by: expense.createdBy,
                },
            })

            const index = expenses.value.findIndex((i) => i.id === expense.id)
            if (index !== -1) expenses.value[index] = expense
        } catch (err: any) {
            error.value = err.message || "Failed to update expense"
        }
    }

    // --- Delete expense ---
    const deleteExpense = async (id: number) => {
        try {
            await $fetch(`http://localhost:8000/api/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            expenses.value = expenses.value.filter((i) => i.id !== id)
        } catch (err: any) {
            error.value = err.message || "Failed to delete expense"
        }
    }

    return {
        expenses,
        categories,
        loading,
        error,
        fetchExpenses,
        fetchCategories,
        addExpense,
        updateExpense,
        deleteExpense,
    }
}
