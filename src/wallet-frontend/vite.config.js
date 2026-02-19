import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    server: {
        host: true,
        port: 8000,
        allowedHosts: true
    }
})
