import { ref, computed, onMounted } from "vue";
import type { AppUser } from "~/types/userapp";

export const useUserAppData = () => {
  const users = ref<AppUser[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref("");

  const getToken = () => (process.client ? localStorage.getItem("token") || "" : "");

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data: AppUser[] = await $fetch("http://localhost:8000/api/app/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // Map profile and creator_name for UI
      users.value = (Array.isArray(data) ? data : []).map(u => ({
  ...u,
  profile: u.image && u.image.startsWith('http') ? u.image : u.image ? `http://localhost:8000/storage/${u.image}` : '/img/default-avatar.png',
  creator_name: u.creator ? `${u.creator.first_name} ${u.creator.last_name}` : '-'
}));


    } catch (err: any) {
      error.value = err.message || "Failed to fetch users";
    } finally {
      loading.value = false;
    }
  };

  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    return users.value.filter((user) =>
      (user.first_name || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.last_name || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.phone_number || "").toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  onMounted(() => fetchUsers());

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    fetchUsers,
  };
};
