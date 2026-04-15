import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import QRCode from "react-qr-code";

let dialogHandler = null;

export function registerWalletDialog(handler) {
    dialogHandler = handler;
}

export function showWalletRequestDialog(payload) {
    if (dialogHandler) return dialogHandler(payload);
    return Promise.reject(new Error("Wallet request dialog is not mounted"));
}

export function WalletRequestDialog() {
    const [open, setOpen] = useState(false)
    const [requestData, setRequestData] = useState(null)
    const [copied, setCopied] = useState(false)
    const activeRequestRef = useRef(null)

    useEffect(() => {
        const handler = (payload) => {
            if (activeRequestRef.current) {
                activeRequestRef.current.cancel(new Error("Superseded by a new wallet request"))
            }

            setRequestData(payload)
            setOpen(true)
            setCopied(false)

            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const pollRes = await fetch(`/api/wallet/status/${payload.nonce}`);
                        if (pollRes.status === 200) {
                            const data = await pollRes.json();
                            clearInterval(interval);
                            activeRequestRef.current = null;
                            setOpen(false);
                            resolve(data);
                        } else if (pollRes.status === 404) {
                            clearInterval(interval);
                            activeRequestRef.current = null;
                            setOpen(false);
                            reject(new Error('Wallet session not found or expired'));
                        }
                    } catch { }
                }, 1000);

                activeRequestRef.current = {
                    cancel: (err) => {
                        clearInterval(interval);
                        reject(err || new Error('User cancelled wallet request'));
                    }
                }
            });
        };

        registerWalletDialog(handler)
        return () => {
            if (activeRequestRef.current) {
                activeRequestRef.current.cancel(new Error('Wallet request dialog unmounted'));
            }
            registerWalletDialog(null)
        }
    }, [])

    const handleCopy = () => {
        if (requestData?.request) {
            navigator.clipboard.writeText(requestData.request)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        if (activeRequestRef.current) {
            activeRequestRef.current.cancel();
            activeRequestRef.current = null;
        }
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && handleClose()}>
            <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {requestData?.title || 'Waiting for Wallet Verification'}
                    </DialogTitle>
                    <DialogDescription>
                        {requestData?.description || 'Please copy the request below and paste it into the Wallet Verify page.'}
                    </DialogDescription>
                </DialogHeader>
                {requestData && (
                    <div className="space-y-4 flex flex-col justify-center items-center">
                        <div className="bg-white p-4 rounded-xl border">
                            <QRCode value={requestData.request} size={512} className="h-auto max-w-full" />
                        </div>
                        <pre className="w-full bg-muted dark:bg-slate-800 p-4 rounded-md overflow-x-auto text-xs text-left max-h-32">
                            {requestData.request}
                        </pre>
                        <Button className="w-full font-semibold" onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy Request'}
                        </Button>
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground mt-6 pt-4 border-t dark:border-slate-800">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <p className="text-sm">Polling for proof completion...</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
