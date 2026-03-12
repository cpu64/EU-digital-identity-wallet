import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { CartSheet } from '@/components/CartSheet'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { ShopPage } from '@/pages/ShopPage'
import { ProductPage } from '@/pages/ProductPage'
import * as cart from '@/services/cart'
import * as wallet from '@/services/wallet'

export default function App() {
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [ageConfirmed, setAgeConfirmed] = useState(false)

    async function startCheckout() {
        if (cart.hasExtreme() && !ageConfirmed) {
            try {
                const creds = await wallet.requestAgeOver18()
                if (!creds.age_over_18) {
                    throw new Error("Age verification failed. You must be over 18 to purchase extreme hot sauces.")
                }
                setAgeConfirmed(true)
                setCheckoutOpen(true)
            } catch (err) {
                window.alert(err.message)
            }
        } else {
            setCheckoutOpen(true)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="font-semibold text-sm tracking-tight">Hot Sauce Shop</Link>
                    <CartSheet onCheckout={startCheckout} />
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
                <Routes>
                    <Route path="/" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                </Routes>
            </main>

            <CheckoutDialog
                open={checkoutOpen}
                ageConfirmed={ageConfirmed}
                onClose={() => { setCheckoutOpen(false); setAgeConfirmed(false) }}
            />
        </div>
    )
}
