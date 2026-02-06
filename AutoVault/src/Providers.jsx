import React from 'react'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

/* ----------------------------------------
   Arbitrum Sepolia (Web3-Onboard Chain)
----------------------------------------- */
export const arbitrumSepolia = {
    id: '0x66eee', // 421614 (hex)
    token: 'ETH',
    label: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc'
}

/* ----------------------------------------
   Wallet Modules
----------------------------------------- */
const injected = injectedModule()

/* ----------------------------------------
   Web3-Onboard Init
----------------------------------------- */
const web3Onboard = init({
    wallets: [injected],
    chains: [arbitrumSepolia],
    appMetadata: {
        name: 'AutoVault',
        icon: '<svg></svg>', // Placeholder or actual SVG string
        description: 'Privacy-preserving confidential computing on iExec',
        recommendedInjectedWallets: [
            { name: 'MetaMask', url: 'https://metamask.io' },
            { name: 'Trust Wallet', url: 'https://trustwallet.com' }
        ]
    },
    accountCenter: {
        desktop: { enabled: false },
        mobile: { enabled: false }
    },
    theme: 'dark'
})

/* ----------------------------------------
   Optional: expose onboard globally
----------------------------------------- */
if (typeof window !== 'undefined') {
    window.onboard = web3Onboard
}

import { BrowserRouter } from 'react-router-dom'

/* ----------------------------------------
   Providers Wrapper
----------------------------------------- */
export function Providers({ children }) {
    return (
        <Web3OnboardProvider web3Onboard={web3Onboard}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </Web3OnboardProvider>
    )
}
