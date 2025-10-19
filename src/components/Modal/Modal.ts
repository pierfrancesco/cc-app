import type { Product } from '../../types';
import { NestedDropdown } from '../NestedDropdown/NestedDropdown';
import { onEscape, getIbuColorClass } from '../../services/utils';

interface ModalConfig {
    onClose: () => void;
}

export class Modal {
    private overlayElement: HTMLElement;
    private modalContentElement: HTMLElement | null = null;
    private dropdownComponent: NestedDropdown;
    private onClose: () => void;
    private escapeUnsub: (() => void) | null = null;

    constructor(config: ModalConfig) {
        this.onClose = config.onClose;

        const overlay = document.getElementById('product-modal-overlay');
        if (!overlay) throw new Error('Modal container not found: add #product-modal-overlay to HTML.');
        this.overlayElement = overlay;
        this.modalContentElement = this.overlayElement.querySelector('.modal-body');

        this.dropdownComponent = new NestedDropdown();

        this.ensureCloseButton();
        this.attachEventListeners();
    }

    private ensureCloseButton(): void {
        let closeButton = this.overlayElement.querySelector('.modal-close-button') as HTMLButtonElement | null;
        if (!closeButton) {
            const containerForButton = this.overlayElement.querySelector('.modal-content-area') || this.overlayElement;
            closeButton = document.createElement('button');
            closeButton.className = 'modal-close-button';
            closeButton.setAttribute('aria-label', 'Close modal');
            closeButton.innerHTML = '&times;';
            containerForButton.appendChild(closeButton);
        }
        closeButton.addEventListener('click', () => this.onClose());
    }

    private attachEventListeners(): void {
        this.overlayElement.addEventListener('click', (e) => {
            if (e.target === this.overlayElement) this.onClose();
        });
    }

    public show(product: Product): void {
        if (!this.modalContentElement) {
            const contentArea = this.overlayElement.querySelector('.modal-content-area');
            if (!contentArea) {
                console.error('Modal content area not found.');
                return;
            }
            const body = document.createElement('div');
            body.className = 'modal-body';
            contentArea.appendChild(body);
            this.modalContentElement = body;
        }

        const ibuLabel = product.ibu ?? '—';
        const abvLabel = product.abv ?? '—';
        const ibuClass = getIbuColorClass(product.ibu ?? 0);

        this.modalContentElement.innerHTML = `
      <div class="modal-left">
        <div class="modal-image-circle ${ibuClass}" aria-hidden="false">
          <div class="modal-image-inner" aria-hidden="false">
            <img
              src="${product.image_url || 'https://placehold.co/600x600/cccccc/333333?text=No+Image'}"
              alt="Image of ${product.name}"
              class="modal-product-image"
              onerror="this.onerror=null; this.src='https://placehold.co/600x600/cccccc/333333?text=No+Image';"
            />
          </div>
          <div class="modal-ibu" aria-label="IBU: ${ibuLabel}">
            <span class="ibu-label">IBU</span>
            <span class="ibu-value">${ibuLabel}</span>
          </div>
          <div class="modal-abv" aria-label="ABV: ${abvLabel}%">${abvLabel}%</div>
        </div>

        <h2 class="modal-title">${product.name}</h2>
      </div>

      <div class="modal-right">
        <div class="modal-right-body">
          <div class="modal-description">
            ${product.description ?? '<em>No description available.</em>'}
          </div>
          <div class="modal-footer" aria-label="Product options"></div>
        </div>
      </div>
    `;

        const rightFooter = this.overlayElement.querySelector('.modal-right .modal-footer');
        const footerTarget = rightFooter ?? this.overlayElement.querySelector('.modal-footer');

        if (footerTarget) {
            const existing = footerTarget.querySelector('.order-dropdown-wrapper');
            if (existing) footerTarget.removeChild(existing);
            footerTarget.appendChild(this.dropdownComponent.getElement());
        } else {
            console.error('Modal footer element not found for dropdown injection.');
        }

        if (typeof this.dropdownComponent.toggleDropdown === 'function') {
            this.dropdownComponent.toggleDropdown(true);
        }

        this.escapeUnsub = onEscape(() => this.onClose());

        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('is-visible');
        document.body.classList.add('modal-open');
    }

    public hide(): void {
        if (this.escapeUnsub) {
            this.escapeUnsub();
            this.escapeUnsub = null;
        }
        this.overlayElement.classList.add('hidden');
        this.overlayElement.classList.remove('is-visible');
        document.body.classList.remove('modal-open');
    }
}
