import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReviewDialog } from '@/components/ReviewDialog'
import * as cart from '@/services/cart'

function fmt(cents) { return `€${(cents / 100).toFixed(2)}` }
function fmtScoville(n) { return n.toLocaleString('en-US') }
function fmtDate(str) {
    return new Date(str + 'Z').toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

function StarRating({ rating }) {
    if (!rating) return null;
    return (
        <div className="flex items-center text-primary">
            {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-current' : 'text-muted-foreground'}`} />
            ))}
        </div>
    )
}

export function ProductPage() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reviewOpen, setReviewOpen] = useState(false)

    const load = useCallback(() => {
        fetch(`/api/products/${id}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json() })
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => { load() }, [load])

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (!data) return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to shop
            </Link>
            <p className="text-sm">Product not found.</p>
        </div>
    )

    const { product, reviews } = data
    const extreme = product.scoville > 1_000_000

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to shop
            </Link>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden border">
                    <img src={`/images/products/${product.id}.jpg`} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center py-4">
                    {extreme && <Badge variant="destructive" className="w-fit mb-4 text-sm">Extreme — 18+ Verification Required</Badge>}
                    <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                    <p className="text-base text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-2xl font-bold">{fmt(product.price_cents)}</span>
                        <Badge variant="outline" className="text-sm py-1 px-3 bg-card">{fmtScoville(product.scoville)} SHU</Badge>
                    </div>
                    <Button size="lg" className="w-full sm:w-auto font-semibold text-base" onClick={() => cart.addItem(product)}>Add to cart</Button>
                </div>
            </div>

            <hr className="my-8" />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Reviews ({reviews.length})</h2>
                <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>Write a review</Button>
            </div>

            {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
            ) : (
                <div className="space-y-3">
                    {reviews.map(r => {
                        const author = [r.first_name, r.family_name].filter(Boolean).join(' ') || 'Anonymous'
                        return (
                            <div key={r.id} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base font-semibold">{author}</span>
                                    {r.nationality && <span className="text-sm text-muted-foreground">({r.nationality})</span>}
                                    <span className="text-sm text-muted-foreground ml-auto">{fmtDate(r.created_at)}</span>
                                </div>
                                <div className="mb-2">
                                    <StarRating rating={r.rating || 5} />
                                </div>
                                <p className="text-base">{r.body}</p>
                            </div>
                        )
                    })}
                </div>
            )}

            <ReviewDialog
                open={reviewOpen}
                productId={product.id}
                onClose={() => setReviewOpen(false)}
                onPosted={load}
            />
        </div>
    )
}
