export function useUrlValidator() {
    const isValidUrl = (url: string | null | undefined): url is string => {
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
  
    return { isValidUrl };
  }