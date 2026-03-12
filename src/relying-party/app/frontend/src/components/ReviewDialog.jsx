import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField, Textarea } from '@/components/ui/form'
import { Star } from 'lucide-react'
import * as wallet from '@/services/wallet'

export function ReviewDialog({ open, productId, onClose, onPosted }) {
    const [fields, setFields] = useState({ body: '', rating: 5 })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    function set(k) { return e => setFields(f => ({ ...f, [k]: e.target.value })) }
    function setRating(r) { setFields(f => ({ ...f, rating: r })) }
    function reset() { setFields({ body: '', rating: 5 }); setError(''); setDone(false) }
    function handleClose() { reset(); onClose() }

    async function submit() {
        if (!fields.body.trim()) { setError('Please write something in your review.'); return }

        setLoading(true); setError('')
        try {
            // Native redirect mock
            const creds = await wallet.requestReviewClaims()

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    first_name: creds.first_name,
                    family_name: creds.family_name || null,
                    nationality: creds.nationality || null,
                    body: fields.body.trim(),
                    rating: fields.rating,
                }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? 'Failed to post review.'); return }
            setDone(true)
            onPosted()
        } catch (err) {
            setError(err.message || 'Network error. Please try again.')
        } finally { setLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                {done ? (
                    <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p className="text-2xl font-bold">Review posted</p>
                        <p className="text-base text-muted-foreground">Your verified review has been published. Thank you!</p>
                        <Button className="mt-4 w-full" variant="outline" onClick={handleClose}>Close</Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Write a review</DialogTitle>
                            <DialogDescription>
                                Share your thoughts with other spice enthusiasts.
                                Please note that posting requires disclosing your verified Identity (First Name) through your wallet.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Rating *</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            className="focus:outline-none focus-visible:ring-2 rounded-sm ring-primary p-0.5"
                                            onClick={() => setRating(r)}
                                            aria-label={`Rate ${r} stars`}
                                        >
                                            <Star className={`h-7 w-7 transition-colors pointer-events-none ${r <= fields.rating ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <FormField label="Your Review *">
                                <Textarea className="min-h-[100px] text-base" placeholder="Share your thoughts about this hot sauce..." value={fields.body} onChange={set('body')} />
                            </FormField>

                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>

                        <div className="flex justify-end gap-2 mt-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={submit} disabled={loading} className="gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                                {loading ? 'Processing…' : 'Submit Review via EUDI Wallet'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
