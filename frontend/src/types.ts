export interface Listing {
  id: string;
  source: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  listedDate: string;
  status: 'active' | 'pending' | 'sold';
  description: string;
  latitude: number;
  longitude: number;
  relevanceScore: number;
}

export interface SearchResponse {
  results: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type Filters = {
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  city: string;
  keyword: string;
  targetBudget: string;
  pageSize: string;
};
