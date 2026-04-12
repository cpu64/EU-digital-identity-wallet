import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import * as cart from '@/services/cart'

function fmt(cents) { return `€${(cents / 100).toFixed(2)}` }
function fmtScoville(n) { return n.toLocaleString('en-US') }

function ProductCard({ product }) {
    const extreme = product.scoville > 1_000_000
    const imgUrl = `/images/products/${product.id}.jpg`

    return (
        <div className={`group relative flex flex-col border dark:border-slate-800 rounded-2xl bg-card dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${extreme ? 'ring-1 ring-destructive/30' : ''}`}>
            <div className="aspect-square bg-muted dark:bg-slate-800 overflow-hidden relative border-b dark:border-slate-800">
                <img src={imgUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                {extreme && <Badge variant="destructive" className="absolute top-2 right-2 shadow-sm bg-destructive/90 backdrop-blur-sm text-sm">Extreme 18+</Badge>}
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
                <h2 className="font-semibold text-base leading-tight line-clamp-1">
                    <Link to={`/product/${product.id}`} className="group-hover:text-primary transition-colors before:absolute before:inset-0">
                        {product.name}
                    </Link>
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-1 relative z-10 pointer-events-none">{product.description}</p>
                <div className="flex items-end justify-between mt-auto relative z-10 pt-2 border-t dark:border-slate-800">
                    <div>
                        <p className="font-bold text-base">{fmt(product.price_cents)}</p>
                        <p className="text-sm font-medium text-muted-foreground">{fmtScoville(product.scoville)} SHU</p>
                    </div>
                    <Button size="sm" className="font-semibold" onClick={(e) => { e.preventDefault(); cart.addItem(product) }}>Add to cart</Button>
                </div>
            </div>
        </div>
    )
}

export function ShopPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/products')
            .then(r => r.json())
            .then(setProducts)
            .catch(() => setError('Failed to load products.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground">Loading products...</p>
    if (error) return <p className="text-sm text-destructive">{error}</p>

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">Hot Sauces</h1>
            <p className="text-sm text-muted-foreground mb-6">Sorted mildest to hottest. Age verification required for extreme varieties.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    )
}
