export const isLocal = () => window.location.hostname.endsWith('.wallet.test');
export const BACKEND_URL = isLocal() ? 'https://wallet-backend.wallet.test' : '/wallet-backend';
export const TRUSTED_LIST_URL = isLocal() ? 'https://public.trusted-list.wallet.test' : '/public-trusted-list';
export const getAssetUrl = (path: string) => {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    return (base.endsWith('/') ? base.slice(0, -1) : base) + (path.startsWith('/') ? path : `/${path}`);
};
