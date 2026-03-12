import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { init as initWallet } from './services/wallet'
import './index.css'

initWallet().then(() => {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    )
})
