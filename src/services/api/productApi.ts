import type { Product } from '../../types';
import { getHttpErrorMessageFromResponse } from '../utils';

const API_URL = 'https://api.jsonbin.io/v3/b/6630fd9be41b4d34e4ecd1f9';

/**
 * Fetches the product catalog data from the external API endpoint.
 * Implements robust error handling as required by the spec.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function fetchProducts(): Promise<Product[]> {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const msg = getHttpErrorMessageFromResponse(response, 'Failed to load catalog data');
            throw new Error(msg);
        }

        const responseData = await response.json();
        return responseData?.record ?? [];
    } catch (error) {
        console.error('API Fetch Error:', error);
        if (error instanceof Error) throw new Error(error.message);
        throw new Error('An unknown network error occurred while fetching products.');
    }
}
