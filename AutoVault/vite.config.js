import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    nodePolyfills(),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increase slightly for the web3 chunk if needed
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'web3-vendor': ['ethers', '@iexec/dataprotector', '@web3-onboard/core', '@web3-onboard/react', '@web3-onboard/injected-wallets'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
          'charts': ['recharts', 'react-countup'],
        },
      },
    },
  },
})
