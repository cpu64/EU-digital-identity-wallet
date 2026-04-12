import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/form'
import * as cart from '@/services/cart'
import * as wallet from '@/services/wallet'

export function CheckoutDialog({ open, ageConfirmed, onClose }) {
    const [step, setStep] = useState('form')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [fields, setFields] = useState({ email: '', address: '' })

    function reset() { setStep('form'); setError(''); setFields({ email: '', address: '' }); }
    function handleClose() { reset(); onClose() }

    async function placeOrder() {
        setLoading(true); setError('')
        const body = {
            age_confirmed: ageConfirmed,
            items: cart.getItems().map(i => ({ product_id: i.id, qty: i.qty ?? 1 })),
            email: fields.email || null,
            address: fields.address || null,
        }
        try {
            const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? 'Checkout failed.'); return }
            cart.clearCart()
            setStep('success')
        } catch {
            setError('Network error. Please try again.')
        } finally { setLoading(false) }
    }

    function submitManual() {
        placeOrder()
    }

    async function fillWithWallet() {
        setError('')
        try {
            const creds = await wallet.requestCheckoutInfo({
                title: "Verify Identity for Checkout",
                description: "Provide your delivery address and email from your EUDI Wallet."
            })
            setFields({ email: creds.email, address: creds.address })
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && handleClose()}>
            <DialogContent className="sm:max-w-md">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Complete Checkout</DialogTitle>
                            <DialogDescription>
                                Enter your delivery details manually or check out quickly with EUDI Wallet.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-2">
                            <FormField label="Email (optional)">
                                <Input type="email" placeholder="john@example.com" value={fields.email} onChange={e => setFields(f => ({ ...f, email: e.target.value }))} className="bg-white dark:bg-slate-900" />
                            </FormField>
                            <FormField label="Delivery Address (optional)">
                                <Input placeholder="123 Spice Lane" value={fields.address} onChange={e => setFields(f => ({ ...f, address: e.target.value }))} className="bg-white dark:bg-slate-900" />
                            </FormField>
                        </div>

                        {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                        <div className="flex flex-col gap-3 pt-2 mt-4 border-t dark:border-slate-800">
                            <Button variant="outline" onClick={fillWithWallet} disabled={loading} className="w-full font-semibold gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                                Fill details with EUDI Wallet
                            </Button>
                            <Button onClick={submitManual} disabled={loading} className="w-full font-semibold">
                                {loading ? 'Processing…' : 'Checkout'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p className="text-2xl font-bold">Order placed</p>
                        <p className="text-sm text-muted-foreground">Your credentials were verified and your hot sauces are on the way!</p>
                        <Button className="mt-6 w-full" variant="outline" onClick={handleClose}>Close</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
