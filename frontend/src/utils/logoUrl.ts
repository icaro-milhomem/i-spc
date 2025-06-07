const API_URL = import.meta.env.VITE_API_URL || '';

export function getLogoUrl(logoPath?: string | null): string | undefined {
  if (!logoPath) return undefined;
  return logoPath;
} 