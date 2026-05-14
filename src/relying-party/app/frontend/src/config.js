export const isLocal = () => window.location.hostname.endsWith('.wallet.test');
export const API_BASE = isLocal() ? 'https://relying-party.wallet.test' : '/relying-party';
export const PUBLIC_TL_URL = isLocal() ? 'https://public.trusted-list.wallet.test' : '/public-trusted-list';
export const PUBLIC_RP_URL = isLocal() ? 'https://public.relying-party.wallet.test' : '/public-relying-party';
export const getAssetUrl = (path) => {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    return (base.endsWith('/') ? base.slice(0, -1) : base) + (path.startsWith('/') ? path : `/${path}`);
};
