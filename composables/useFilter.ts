function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

interface FilterConfig<T> {
  key: keyof T | string;
  ref: Ref<string | number | undefined>;
}

interface UseFilterConfig<T> {
  searchQuery: Ref<string>;
  searchKeys: (keyof T | string)[];
  filters?: FilterConfig<T>[];
}

export function useFilter<T extends Record<string, any>>(
  data: Ref<T[]>,
  config: UseFilterConfig<T>
) {
  const filteredData = computed(() => {
    const query = config.searchQuery.value.toLowerCase().trim();

    return data.value.filter((item) => {
      const searchMatch =
        !query ||
        config.searchKeys.some((key) => {
          const value = getNestedValue(item, String(key));
          return String(value).toLowerCase().includes(query);
        });

      const filtersMatch =
        !config.filters ||
        config.filters.every((filter) => {
          const selectedValue = filter.ref.value;
          if (selectedValue === "" || selectedValue === undefined) {
            return true;
          }
          const itemValue = getNestedValue(item, String(filter.key));
          return itemValue === selectedValue;
        });

      return searchMatch && filtersMatch;
    });
  });

  return {
    filteredData,
  };
}
