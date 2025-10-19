export class NestedDropdown {
    private element: HTMLElement;
    private toggleButton: HTMLButtonElement;
    private menu: HTMLElement;
    private isOpen = false;
    private items = ['Glass', 'Can', 'Box'];
    private quantities = ['1', '2', '3'];

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'order-dropdown-wrapper';

        this.element.appendChild(this.buildToggle());

        this.menu = this.buildMenu();
        this.menu.classList.add('hidden');
        this.element.appendChild(this.menu);

        this.toggleButton = this.element.querySelector('.order-toggle') as HTMLButtonElement;

        this.attachListeners();
    }

    private buildToggle(): HTMLElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'order-toggle';
        btn.setAttribute('aria-expanded', 'false');

        const span = document.createElement('span');
        span.className = 'order-label';
        span.textContent = 'Order';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chev');
        svg.setAttribute('width', '12');
        svg.setAttribute('height', '12');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.innerHTML = '<path fill="currentColor" d="M7 10l5 5 5-5z"/>';

        btn.appendChild(span);
        btn.appendChild(svg);
        return btn;
    }

    private buildMenu(): HTMLElement {
        const menu = document.createElement('div');
        menu.className = 'order-menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-hidden', 'true');

        const list = document.createElement('ul');
        list.className = 'order-list';
        list.setAttribute('role', 'none');

        for (const key of this.items) {
            const itemWrapper = document.createElement('ul');
            itemWrapper.className = 'order-item';
            itemWrapper.setAttribute('data-key', key);
            itemWrapper.setAttribute('role', 'none');

            const itemBtn = document.createElement('button');
            itemBtn.type = 'button';
            itemBtn.className = 'order-item-btn';
            itemBtn.setAttribute('role', 'menuitem');
            itemBtn.textContent = key;

            const submenu = document.createElement('ul');
            submenu.className = 'order-submenu hidden';
            submenu.setAttribute('role', 'menu');
            submenu.setAttribute('aria-hidden', 'true');

            for (const q of this.quantities) {
                const subEntryWrap = document.createElement('ul');
                subEntryWrap.className = 'order-subentry';
                const subBtn = document.createElement('button');
                subBtn.type = 'button';
                subBtn.className = 'order-subitem';
                subBtn.setAttribute('role', 'menuitem');
                subBtn.textContent = q;
                subEntryWrap.appendChild(subBtn);
                submenu.appendChild(subEntryWrap);
            }

            itemWrapper.appendChild(itemBtn);
            itemWrapper.appendChild(submenu);
            list.appendChild(itemWrapper);
        }

        menu.appendChild(list);
        return menu;
    }

    private attachListeners(): void {
        this.element.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            if (target.closest('.order-toggle')) {
                e.stopPropagation();
                this.toggleDropdown();
                return;
            }

            if (target.classList.contains('order-item-btn')) {
                const li = target.closest('.order-item') as HTMLElement | null;
                if (!li) return;
                const submenu = li.querySelector('.order-submenu') as HTMLElement | null;
                if (!submenu) return;

                this.element.querySelectorAll('.order-submenu').forEach((s) => {
                    if (s !== submenu) s.classList.add('hidden');
                });

                submenu.classList.toggle('hidden');
                e.stopPropagation();
                return;
            }

            if (target.classList.contains('order-subitem')) {
                const value = target.textContent?.trim();
                const parentItem = target.closest('.order-item')?.getAttribute('data-key') ?? '';
                console.log('Order selected:', parentItem, value);
                this.closeAll();
            }
        });

        const outsideHandler = () => this.closeAll();
        document.addEventListener('click', outsideHandler);
    }

    public toggleDropdown(forceClose?: boolean): void {
        if (forceClose === true) {
            this.closeAll();
            return;
        }
        this.isOpen = !this.isOpen;
        this.menu.classList.toggle('hidden', !this.isOpen);
        this.menu.setAttribute('aria-hidden', String(!this.isOpen));
        this.toggleButton.setAttribute('aria-expanded', String(this.isOpen));
    }

    private closeAll(): void {
        this.isOpen = false;
        this.menu.classList.add('hidden');
        this.menu.setAttribute('aria-hidden', 'true');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.element.querySelectorAll('.order-submenu').forEach((s) => s.classList.add('hidden'));
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}

