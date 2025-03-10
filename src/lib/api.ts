import { ProductBase } from '@/types/types';

/**
 * Fetches a single product by its ID
 * @param url The API URL to fetch from
 * @returns Promise with product data
 */
export async function fetchProduct(url: string): Promise<ProductBase> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Fetches related products based on product ID and/or category
 * @param productId The ID of the current product
 * @param category The category of the current product
 * @param limit Maximum number of related products to return
 * @returns Promise with an array of related products
 */
export async function fetchRelatedProducts(
  productId: string,
  category?: string,
  limit: number = 4
): Promise<ProductBase[]> {
  try {
    const url = `/api/products/related?id=${productId}&category=${category || ''}&limit=${limit}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch related products: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return []; // Return empty array instead of throwing to prevent UI issues
  }
}

/**
 * Fetches products with optional filtering
 * @param page Page number for pagination
 * @param limit Number of products per page
 * @param category Filter by category name
 * @param search Search term for filtering
 * @param sortBy Sort field (e.g., 'price', 'name')
 * @param sortOrder Sort direction ('asc' or 'desc')
 * @returns Promise with product data and pagination info
 */
export async function fetchProducts({
  page = 1,
  limit = 12,
  category,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{
  products: ProductBase[];
  total: number;
  totalPages: number;
  page: number;
}> {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (category) {
      params.append('category', category);
    }

    if (search) {
      params.append('search', search);
    }

    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    const url = `/api/products?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    return {
      products: data.products,
      total: data.total,
      totalPages: data.totalPages,
      page: data.page,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      total: 0,
      totalPages: 1,
      page: 1,
    };
  }
}

/**
 * Fetches product categories
 * @returns Promise with an array of unique categories
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const response = await fetch('/api/categories', {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetches product reviews summary
 * @param productId The product ID to get reviews for
 * @returns Promise with review summary data
 */
export async function fetchReviewSummary(productId: string): Promise<{
  averageRating: number;
  total: number;
  reviews: any[];
}> {
  try {
    const response = await fetch(`/api/reviews/summary?productId=${productId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch review summary: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching review summary:', error);
    return {
      averageRating: 0,
      total: 0,
      reviews: [],
    };
  }
}