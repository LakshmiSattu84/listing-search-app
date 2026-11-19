import type { Filters } from '../types';

export const defaultFilters: Filters = {
  city: '', keyword: '', minPrice: '', maxPrice: '',
  minBedrooms: '', targetBudget: '', pageSize: '5',
};

export function validateFilters(filters: Filters): string | null {
  for (const key of ['minPrice', 'maxPrice', 'minBedrooms', 'targetBudget'] as const) {
    const value = filters[key].trim();
    if (value && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      return `${key} must be a non-negative number.`;
    }
  }
  if (filters.targetBudget.trim() && Number(filters.targetBudget) === 0) {
    return 'Target budget must be greater than zero.';
  }
  if (filters.minBedrooms.trim() && !Number.isInteger(Number(filters.minBedrooms))) {
    return 'Minimum bedrooms must be a whole number.';
  }
  if (filters.minPrice.trim() && filters.maxPrice.trim() &&
      Number(filters.minPrice) > Number(filters.maxPrice)) {
    return 'Minimum price cannot exceed maximum price.';
  }
  const pageSize = Number(filters.pageSize);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return 'Page size must be between 1 and 100.';
  }
  return null;
}
