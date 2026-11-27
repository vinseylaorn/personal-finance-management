import { ref } from "vue"
import { useUserStore } from "~/store/user"
import type { Income } from "~/types/income"
import type { Category } from "~/types/category"

export const useIncomeApi = () => {
    const incomes = ref<Income[]>([])
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const userStore = useUserStore() // 👉 get logged in user

    const getToken = () => (process.client ? localStorage.getItem("token") || "" : "")

    // --- Fetch all incomes ---
    const fetchIncomes = async () => {
        loading.value = true
        try {
            const data = await $fetch<any[]>("http://localhost:8000/api/incomes", {
                headers: { Authorization: `Bearer ${getToken()}` },
            })

            incomes.value = data.map((i) => ({
                id: i.id,
                source: i.source,
                categoryId: i.category_id,
                category: i.category?.name || "Unknown",
                amount: i.amount,
                createdBy: i.created_by,
                createdAt: i.created_at.split("T")[0],
            }))
        } catch (err: any) {
            error.value = err.message || "Failed to fetch incomes"
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

    // --- Add new income ---
    const addIncome = async (income: Partial<Income>) => {
        try {
            const newIncome = await $fetch<any>("http://localhost:8000/api/incomes", {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: {
                    source: income.source,
                    amount: income.amount,
                    category_id: income.categoryId,
                    // ✅ take username from logged-in user
                    created_by: userStore.user?.username || "Unknown",
                },
            })

            incomes.value.push({
                id: newIncome.id,
                source: newIncome.source,
                categoryId: newIncome.category_id,
                amount: newIncome.amount,
                createdBy: newIncome.created_by,
                createdAt: newIncome.created_at.split("T")[0],
            })
        } catch (err: any) {
            error.value = err.message || "Failed to add income"
        }
    }

    // --- Update income ---
    const updateIncome = async (income: Income) => {
        try {
            await $fetch(`http://localhost:8000/api/incomes/${income.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: {
                    source: income.source,
                    amount: income.amount,
                    category_id: income.categoryId,
                    created_by: income.createdBy,
                },
            })

            const index = incomes.value.findIndex((i) => i.id === income.id)
            if (index !== -1) incomes.value[index] = income
        } catch (err: any) {
            error.value = err.message || "Failed to update income"
        }
    }

    // --- Delete income ---
    const deleteIncome = async (id: number) => {
        try {
            await $fetch(`http://localhost:8000/api/incomes/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            incomes.value = incomes.value.filter((i) => i.id !== id)
        } catch (err: any) {
            error.value = err.message || "Failed to delete income"
        }
    }

    return {
        incomes,
        categories,
        loading,
        error,
        fetchIncomes,
        fetchCategories,
        addIncome,
        updateIncome,
        deleteIncome,
    }
}
