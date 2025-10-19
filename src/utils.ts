// src/utils.ts

import type { Product } from './types';

// simple debounce returning a function with the same parameters as fn
export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300): (...args: Parameters<T>) => void {
    let timer: number | undefined;
    return (...args: Parameters<T>) => {
        if (timer !== undefined) {
            window.clearTimeout(timer);
        }
        timer = window.setTimeout(() => {
            fn(...args);
            timer = undefined;
        }, wait);
    };
}

export function showElement(el: HTMLElement | null): void {
    if (!el) return;
    el.style.display = '';
    el.setAttribute('aria-hidden', 'false');
}

export function hideElement(el: HTMLElement | null): void {
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
}

export function filterProducts(products: Product[], searchTerm: string): Product[] {
    const termRaw = searchTerm ?? '';
    const normalized = termRaw.trim();
    if (!normalized) return products;
    const term = normalized.toLowerCase();

    // If the term is numeric (e.g. "45"), match against IBU number or name
    const numeric = Number.isFinite(Number(term)) && term !== '';
    if (numeric) {
        const n = Number(term);
        return products.filter(p => p.ibu === n || String(p.ibu).includes(term) || p.name.toLowerCase().includes(term));
    }

    return products.filter(p => p.name.toLowerCase().includes(term) || String(p.ibu).includes(term));
}
