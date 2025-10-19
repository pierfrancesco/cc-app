export interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
    abv: number;
    ibu: number;
}

export interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    selectedProduct: Product | null;
}

export type StateListener = () => void;
