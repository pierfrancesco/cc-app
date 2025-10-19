// src/router.ts

// Routing helpers: parse/build hash fragments and update the location.

export function parseHash(rawHash?: string): { id: number | null; search: string | null } {
    const raw = (rawHash ?? location.hash) || '';
    const stripped = raw.replace(/^#/, ''); // e.g. "/123?search=ale"
    const match = stripped.match(/^\/(\d+)?(?:\?(.*))?$/);
    if (!match) return { id: null, search: null };
    const id = match[1] ? Number(match[1]) : null;
    const query = match[2] ?? '';
    const params = new URLSearchParams(query);
    const search = params.get('search');
    return { id, search };
}

export function buildHash(id: number | null, search: string | null): string {
    const base = '#/';
    const idPart = id !== null && id !== undefined ? String(id) : '';
    const params = new URLSearchParams();
    if (search !== null && search !== undefined && search !== '') {
        params.set('search', search);
    }
    const query = params.toString();
    return base + idPart + (query ? `?${query}` : '');
}

export function updateHash(id: number | null, search: string | null, mode: 'replace' | 'push' = 'replace'): void {
    const newHash = buildHash(id, search ?? '');
    const newUrl = location.pathname + location.search + newHash;

    if (mode === 'replace') {
        history.replaceState(null, '', newUrl);
        // replaceState doesn't fire hashchange; dispatch a synthetic event so listeners can sync
        window.dispatchEvent(new Event('hashchange'));
    } else {
        if (location.hash !== newHash) {
            location.hash = newHash;
        } else {
            // if identical, still notify listeners
            window.dispatchEvent(new Event('hashchange'));
        }
    }
}

