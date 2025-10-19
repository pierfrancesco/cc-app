import type { Product } from '../../types';
import { getIbuColorClass } from '../../services/utils';

type ProductCardClickHandler = (product: Product) => void;

export class ProductCard {
    private element: HTMLElement;
    private product: Product;
    private onClick: ProductCardClickHandler;
    private static observer: IntersectionObserver | null = null;

    constructor(product: Product, onClick: ProductCardClickHandler) {
        this.product = product;
        this.onClick = onClick;
        this.element = this.createElement();
        this.attachEventListeners();
    }

    private static ensureObserver(): void {
        if (ProductCard.observer) return;

        ProductCard.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target as HTMLImageElement;
                const dataSrc = img.dataset.src;
                if (dataSrc) img.src = dataSrc;
                if (ProductCard.observer) ProductCard.observer.unobserve(img);
            });
        }, {
            root: document.querySelector('#catalog-main'),
            rootMargin: '10px',
            threshold: 0.1,
        });
    }

    private createElement(): HTMLElement {
        const { id, name, abv, ibu, image_url } = this.product;
        const ibuClass = getIbuColorClass(ibu);

        const card = document.createElement('article');
        card.className = `product-card ${ibuClass}`;
        card.setAttribute('data-product-id', String(id));

        const placeholder = 'https://placehold.co/150x250/cccccc/333333?text=Loading';
        card.innerHTML = `
        <span class="abv-badge">${abv}%</span>
        <div class="card-image-wrapper">
            <img
                src="${placeholder}"
                data-src="${image_url}"
                alt="${name} image"
                class="card-image"
            >
            <div class="ibu-badge">
              <span class="spec-label">IBU:</span>
              <span class="spec-value">${ibu}</span>
            </div>
        </div>
        <div class="card-content">
            <h3>${name}</h3>
        </div>
    `;

        const img = card.querySelector('img.card-image') as HTMLImageElement | null;
        if (img) {
            img.addEventListener('error', () => {
                img.src = 'https://placehold.co/150x250/cccccc/333333?text=No+Image';
            });

            ProductCard.ensureObserver();
            if (ProductCard.observer) ProductCard.observer.observe(img);
        }

        return card;
    }

    private attachEventListeners(): void {
        this.element.addEventListener('click', () => this.onClick(this.product));
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}

