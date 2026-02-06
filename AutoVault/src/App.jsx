import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Hero from './components/Hero'
import Features from './components/Features'
import Dashboard from './pages/Dashboard'
import AnalysisResults from './pages/AnalysisResults'
import ABSAnalytics from './pages/ABSAnalytics'
import { useAccount, useSessionRestore } from './hooks/useWeb3Compat'
import ChainGuard from './components/ChainGuard'
import './App.css'

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

function App() {
  const { isConnected } = useAccount()
  const { isRestoring } = useSessionRestore()
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-navigate to dashboard when wallet is connected
  useEffect(() => {
    if (isConnected && location.pathname === '/') {
      navigate('/dashboard')
    }
  }, [isConnected, location.pathname, navigate])

  const handleConnect = async () => {
    if (window.onboard) {
      await window.onboard.connectWallet()
    }
  }

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-[#05060b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Restoring Secure Session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05060b] text-white selection:bg-amber-500/30">
      <Routes>
        <Route path="/" element={
          <main className="animate-fadeIn">
            <Navbar onEnterDashboard={() => navigate('/dashboard')} />
            <Hero
              onEnterDashboard={() => navigate('/dashboard')}
              handleConnect={handleConnect}
              isConnected={isConnected}
            />

            <section className="py-24 text-center">
              <div className="container mx-auto px-6">
                <div className="glass-panel p-16 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
                  <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Ready to Secure Your Portfolio?</h2>
                  <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                    Join the elite group of lenders using AutoVault to power their asset-backed securities with confidential computing.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                      onClick={isConnected ? () => navigate('/dashboard') : handleConnect}
                      className="btn-primary px-12 py-4"
                    >
                      {isConnected ? 'Enter Workspace' : 'Get Started'}
                    </button>
                    <a href="#features" className="btn-secondary px-12 py-4">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <Features />

            <footer className="py-24 border-t border-white/5 text-slate-500 bg-gradient-to-b from-transparent to-white/[0.01]">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="font-black text-white uppercase tracking-tighter text-3xl">
                      AUTO<span className="text-amber-500">VAULT</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-black tracking-[0.4em] uppercase text-center md:text-left mt-1">
                      Confidential ABS Analytics
                    </div>
                  </div>
                  <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em]">
                    <a href="https://iex.ec" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">iExec Network</a>
                    <a href="#features" className="hover:text-amber-400 transition-colors">How It Works</a>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5 text-center">
                  <p className="text-[10px] font-bold tracking-[0.25em] text-slate-700">
                    © 2026 AutoVault · Powered by iExec Confidential Computing
                  </p>
                </div>
              </div>
            </footer>
          </main>
        } />

        <Route path="/dashboard" element={
          <ChainGuard>
            <div className="flex min-h-screen animate-fadeIn">
              {/* Dashboard View with Sidebar - Pattern from Scorely */}
              <Sidebar currentView="dashboard" setView={() => { }} />

              <main className="flex-1 ml-[280px]">
                <Dashboard />
              </main>
            </div>
          </ChainGuard>
        } />

        <Route path="/dashboard/:executionId" element={
          <ChainGuard>
            <div className="flex min-h-screen animate-fadeIn">
              {/* Dashboard View with Sidebar - Pattern from Scorely */}
              <Sidebar currentView="dashboard" setView={() => { }} />

              <main className="flex-1 ml-[280px]">
                <Dashboard />
              </main>
            </div>
          </ChainGuard>
        } />

        <Route path="/results" element={
          <ChainGuard>
            <AnalysisResults />
          </ChainGuard>
        } />

        <Route path="/analytics" element={
          <ABSAnalytics />
        } />
      </Routes>
    </div>
  )
}

export default App
