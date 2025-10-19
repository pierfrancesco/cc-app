// src/App.ts
import {productStore, ProductStore} from './store/ProductStore';
import type {Product} from './types';
import {ProductCard} from './components/ProductCard/ProductCard';
import {Modal} from './components/Modal/Modal';
import {parseHash, updateHash} from './router';
import {debounce, showElement, hideElement, filterProducts} from './utils';

export class App {
    private store: ProductStore;
    private gridContainer: HTMLElement | null = null;
    private modalInstance: Modal;
    private pendingHashId: number | null = null;

    private loadingElement: HTMLElement | null = null;
    private emptyElement: HTMLElement | null = null;
    private errorElement: HTMLElement | null = null;
    private errorTextElement: HTMLElement | null = null;
    private modalOverlayElement: HTMLElement | null = null;

    // Search
    private searchInput: HTMLInputElement | null = null;
    private searchTerm: string = '';

    constructor() {
        this.store = productStore;
        this.modalInstance = new Modal({onClose: () => this.handleModalClose()});

        this.loadingElement = document.getElementById('loading-skeleton');
        this.emptyElement = document.getElementById('empty-state');
        this.errorElement = document.getElementById('error-state');
        this.errorTextElement = this.errorElement?.querySelector('.error-text') ?? null;
        this.modalOverlayElement = document.getElementById('product-modal-overlay');

        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    public async init(): Promise<void> {
        this.initGrid();
        this.initSearch();
        this.store.subscribe(() => this.render());

        this.handleHashChange();

        await this.store.fetchData();

        if (this.pendingHashId !== null) {
            this.store.setSelectedProduct(this.pendingHashId);
            this.pendingHashId = null;
        }
    }

    private initGrid(): void {
        this.gridContainer = document.getElementById('product-grid');
    }

    private initSearch(): void {
        this.searchInput = document.getElementById('product-search') as HTMLInputElement | null;
        if (!this.searchInput) return;
        // debounce the search input to avoid frequent fragment updates
        const debounced = debounce((v: string) => this.setSearchTerm(v), 300);
        this.searchInput.addEventListener('input', (e) => {
            const v = (e.target as HTMLInputElement).value || '';
            debounced(v);
        });
    }

    // Updated: allow optionally avoiding updating the fragment when setting from the fragment itself
    private setSearchTerm(term: string, updateFragment: boolean = true): void {
        const normalized = term.trim();
        if (this.searchTerm === normalized) return;
        this.searchTerm = normalized;

        // If there's an input element, keep it in sync (important when pre-filling from the URL)
        if (this.searchInput && this.searchInput.value !== normalized) {
            this.searchInput.value = normalized;
        }

        // Update the fragment to reflect the search term (use replace to avoid many history entries)
        if (updateFragment) {
            const {selectedProduct} = this.store.getState();
            const id = selectedProduct ? selectedProduct.id : null;
            updateHash(id, this.searchTerm || '', 'replace');
        }

        this.render();
    }

    private render(): void {
        const {products, isLoading, error, selectedProduct} = this.store.getState();

        if (isLoading) {
            showElement(this.loadingElement);
            hideElement(this.emptyElement);
            hideElement(this.errorElement);
            return;
        }

        if (error) {
            hideElement(this.loadingElement);
            hideElement(this.emptyElement);
            showElement(this.errorElement);
            if (this.errorTextElement) this.errorTextElement.textContent = `Error fetching data: ${error}`;
            return;
        }

        if (!products || products.length === 0) {
            hideElement(this.loadingElement);
            hideElement(this.errorElement);
            showElement(this.emptyElement);
            return;
        }

        // Apply search filtering
        const filtered = filterProducts(products, this.searchTerm);

        hideElement(this.loadingElement);
        hideElement(this.emptyElement);
        hideElement(this.errorElement);

        if (filtered.length === 0) {
            // no matches for search
            if (this.gridContainer) this.gridContainer.innerHTML = '';
            showElement(this.emptyElement);
        } else {
            hideElement(this.emptyElement);
            if (this.gridContainer) {
                this.renderGrid(filtered);
            }
        }

        if (selectedProduct) {
            this.modalInstance.show(selectedProduct);
            if (this.modalOverlayElement) this.modalOverlayElement.setAttribute('aria-hidden', 'false');
        } else {
            this.modalInstance.hide();
            if (this.modalOverlayElement) this.modalOverlayElement.setAttribute('aria-hidden', 'true');
        }
    }

    private renderGrid(products: Product[]): void {
        if (!this.gridContainer) return;

        const fragment = document.createDocumentFragment();

        products.forEach((product) => {
            const card = new ProductCard(product, (p: Product) => this.handleCardClick(p));
            fragment.appendChild(card.getElement());
        });

        this.gridContainer.innerHTML = '';
        this.gridContainer.appendChild(fragment);
    }

    private handleCardClick(product: Product): void {
        // Preserve current search when updating the fragment. Use push (new history entry) for navigation clicks.
        const {search} = parseHash();
        const keepSearch = search || this.searchTerm || '';
        updateHash(product.id, keepSearch, 'push');
    }

    private handleModalClose(): void {
        if (location.hash) {
            // remove the id but keep the search term if present
            const {search} = parseHash();
            const keepSearch = search || this.searchTerm || '';
            updateHash(null, keepSearch, 'push');
        } else {
            this.store.setSelectedProduct(null);
        }
    }

    private handleHashChange(): void {
        // Parse both id and search term from the fragment and sync local state.
        const parsed = parseHash();

        // Sync search term from hash (do not re-write the fragment when doing so)
        const incomingSearch = parsed.search ?? '';
        if (incomingSearch !== this.searchTerm) {
            // Set without updating fragment to avoid cycles
            this.setSearchTerm(incomingSearch, false);
        }

        // Now handle product id selection
        if (parsed.id === null) {
            this.pendingHashId = null;
            this.store.setSelectedProduct(null);
            return;
        }

        const id = parsed.id;
        const {products} = this.store.getState();

        if (!products || products.length === 0) {
            this.pendingHashId = id;
            return;
        }

        this.pendingHashId = null;
        this.store.setSelectedProduct(id);
    }
}
