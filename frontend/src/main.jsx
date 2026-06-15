import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' 
import './index.css'
// 1. Tambahkan import WalletProvider dari file context yang sudah dibuat sebelumnya
import { WalletProvider } from './context/WalletContext.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Bungkus komponen App dengan WalletProvider */}
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
)