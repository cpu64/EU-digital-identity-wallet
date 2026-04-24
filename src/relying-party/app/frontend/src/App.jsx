import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { CartSheet } from '@/components/CartSheet'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { WalletRequestDialog } from '@/components/WalletRequestDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShopPage } from '@/pages/ShopPage'
import { ProductPage } from '@/pages/ProductPage'
import * as cart from '@/services/cart'
import * as wallet from '@/services/wallet'
import { toast } from 'sonner'

export default function App() {
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [ageConfirmed, setAgeConfirmed] = useState(false)

    async function startCheckout() {
        if (cart.hasExtreme() && !ageConfirmed) {
            try {
                const creds = await wallet.requestAgeOver18({
                    title: "Verify Age to Enter",
                    description: "Since this hot sauce is extreme, you must prove you are over 18 using your EUDI Wallet."
                })
                if (!creds.age_over_18) {
                    throw new Error("Age verification failed. You must be over 18 to purchase extreme hot sauces.")
                }
                setAgeConfirmed(true)
                toast.success("Age successfully verified with EUDI Wallet")
                setCheckoutOpen(true)
            } catch (err) {
                toast.error(err.message)
            }
        } else {
            setCheckoutOpen(true)
        }
    }

    return (
        <div className="min-h-screen flex flex-col dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
            <header className="sticky top-0 z-40 border-b bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="font-semibold text-sm tracking-tight dark:text-white">Hot Sauce Shop</Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <CartSheet onCheckout={startCheckout} />
                    </div>
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
            <WalletRequestDialog />
        </div>
    )
}
