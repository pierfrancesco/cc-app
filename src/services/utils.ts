export const STATUS_MESSAGES: Record<number, string> = {
    400: 'Bad request — the server could not understand the request.',
    401: 'Unauthorized — please sign in to continue.',
    403: 'Forbidden — you do not have permission to access this resource.',
    404: 'Not found — the requested resource does not exist.',
    408: 'Request timeout — the server took too long to respond. Try again.',
    429: 'Too many requests — slow down and try again in a moment.',
    500: 'Server error — something went wrong on our side. Please try later.',
    502: 'Bad gateway — upstream service returned an invalid response.',
    503: 'Service unavailable — the service is temporarily down. Try again later.',
    504: 'Gateway timeout — upstream service timed out.'
};

export function getHttpErrorMessage(status: number, defaultMessage?: string): string {
    const friendly = STATUS_MESSAGES[status];
    if (friendly) return friendly;
    return defaultMessage ? `${defaultMessage} (code ${status})` : `Unexpected error (code ${status}). Please try again later.`;
}

export function getHttpErrorMessageFromResponse(response: Response, fallback?: string): string {
    return getHttpErrorMessage(response.status, fallback);
}

// Register an Escape key handler; returns an unregister function
export function onEscape(handler: () => void): () => void {
    const listener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
}

export function getIbuColorClass(ibu: number): string {
    if (ibu >= 70) return 'ibu-very-high';
    if (ibu >= 50) return 'ibu-high';
    if (ibu >= 30) return 'ibu-medium';
    return 'ibu-low';
}