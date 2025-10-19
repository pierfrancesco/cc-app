import type { ProductState, StateListener } from '../types';
import { fetchProducts } from '../services/api/productApi';

const INITIAL_STATE: ProductState = {
    products: [],
    isLoading: false,
    error: null,
    selectedProduct: null,
};

export class ProductStore {
    private _state: ProductState = { ...INITIAL_STATE };
    private _listeners: StateListener[] = [];

    public getState(): Readonly<ProductState> {
        return this._state;
    }

    private setState(newState: Partial<ProductState>): void {
        this._state = { ...this._state, ...newState };
        this.notify();
    }

    public subscribe(listener: StateListener): () => void {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter((l) => l !== listener);
        };
    }

    private notify(): void {
        this._listeners.forEach((listener) => listener());
    }

    public async fetchData(): Promise<void> {
        this.setState({ isLoading: true, error: null });

        try {
            const products = await fetchProducts();
            this.setState({ products, isLoading: false, error: null });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected API error occurred.';
            this.setState({ products: [], isLoading: false, error: errorMessage });
        }
    }

    public setSelectedProduct(productId: number | null): void {
        if (productId === null) {
            this.setState({ selectedProduct: null });
            return;
        }

        const selectedProduct = this._state.products.find((p) => p.id === productId) ?? null;
        if (selectedProduct) {
            this.setState({ selectedProduct });
        } else {
            console.error(`Product with ID ${productId} not found.`);
            this.setState({ selectedProduct: null });
        }
    }
}

export const productStore = new ProductStore();
