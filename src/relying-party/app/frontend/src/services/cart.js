// Cart state backed by localStorage.
// Pure functions — React components subscribe via a custom event.

const KEY = 'hss_cart'
const CHANGE_EVENT = 'cart-change'

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? [] }
    catch { return [] }
}

function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getItems() { return load() }

export function addItem(product) {
    const items = load()
    const existing = items.find(i => i.id === product.id)
    if (existing) existing.qty = (existing.qty ?? 1) + 1
    else items.push({ id: product.id, name: product.name, scoville: product.scoville, price_cents: product.price_cents, qty: 1 })
    save(items)
}

export function removeItem(id) {
    save(load().filter(i => i.id !== id))
}

export function clearCart() { save([]) }

export function totalCents() {
    return load().reduce((s, i) => s + i.price_cents * (i.qty ?? 1), 0)
}

export function hasExtreme() {
    return load().some(i => i.scoville > 1_000_000)
}

export function useCartListener(callback) {
    window.addEventListener(CHANGE_EVENT, callback)
    return () => window.removeEventListener(CHANGE_EVENT, callback)
}
