import { useEffect, useState } from 'react'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import * as cart from '@/services/cart'

function fmt(cents) { return `€${(cents / 100).toFixed(2)}` }

export function CartSheet({ onCheckout }) {
    const [items, setItems] = useState(cart.getItems)
    const [open, setOpen] = useState(false)

    useEffect(() => cart.useCartListener(() => setItems(cart.getItems())), [])

    const qty = items.reduce((s, i) => s + (i.qty ?? 1), 0)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {qty > 0 && (
                        <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 leading-none">{qty}</span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your cart</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 pt-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pb-12">
                            <div className="w-16 h-16 rounded-full bg-muted dark:bg-slate-800 flex items-center justify-center text-muted-foreground/50">
                                <ShoppingCart className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-base font-medium">Your cart is empty</p>
                                <p className="text-sm text-muted-foreground">Add some hot sauces to get started.</p>
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>Continue Shopping</Button>
                        </div>
                    ) : items.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {fmt(item.price_cents)} &times; {item.qty ?? 1}
                                    {item.scoville > 1_000_000 && <span className="ml-2 text-destructive font-medium">Extreme</span>}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => cart.removeItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="px-6 py-4 border-t dark:border-slate-800 space-y-3">
                        {cart.hasExtreme() && (
                            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
                                Age verification required for extreme hot sauces at checkout.
                            </p>
                        )}
                        <div className="flex justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span>{fmt(cart.totalCents())}</span>
                        </div>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="pt-4 border-t dark:border-slate-800 sticky bottom-0 bg-background dark:bg-slate-950 pb-6 px-6">
                        <Button className="w-full font-semibold gap-2" size="lg" onClick={() => { setOpen(false); onCheckout() }}>
                            Checkout
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
