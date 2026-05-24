'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  availableStock: number
}

type Product = {
  id: string
  name: string
  sku: string
  warehouses: WarehouseStock[]
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleReserve = async (productId: string, warehouseId: string) => {
    const key = `${productId}-${warehouseId}`
    setReserving(key)
    
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    })
    
    if (res.status === 409) {
      alert('❌ Not enough stock available')
      setReserving(null)
      return
    }
    
    if (res.ok) {
      const reservation = await res.json()
      window.location.href = `/reservation/${reservation.id}`
    } else {
      alert('Error creating reservation')
      setReserving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl animate-pulse mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏥</span>
          </div>
          <p className="text-gray-600 font-medium">Loading medical supplies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-2 shadow-lg">
                <img 
                  src="https://media.allohealth.care/allo-logo-v1.png" 
                  alt="Allo Health" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl">🏥</span>'
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                  Allo Health
                </h1>
                <p className="text-xs text-teal-600">Smart Inventory · Better Care</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/orders" className="hidden md:flex items-center gap-1 text-xs bg-white rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all border border-teal-100">
                <span>📦</span>
                <span className="text-teal-700">My Orders</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-xs bg-teal-50 rounded-full px-3 py-1.5">
                <span>🛡️</span>
                <span className="text-teal-700">ISO Certified</span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs bg-emerald-50 rounded-full px-3 py-1.5">
                <span>🚚</span>
                <span className="text-emerald-700">Free Shipping</span>
              </div>
              <span className="text-xl text-gray-500 hover:text-teal-600 cursor-pointer transition-colors">🔔</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <span>❤️</span>
              <span>Trusted by 500+ healthcare providers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Smart Inventory for
              <span className="block text-teal-200">Better Patient Care</span>
            </h1>
            <p className="text-teal-100 text-lg mb-8">
              Real-time stock management with 10-minute reservation holds.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">⏰ 10 min hold</div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">✓ Secure checkout</div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">🚚 Free delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-around text-center">
            <div><div className="text-2xl font-bold text-teal-600">98.5%</div><div className="text-sm text-gray-500">Fulfillment Rate</div></div>
            <div><div className="text-2xl font-bold text-teal-600">142</div><div className="text-sm text-gray-500">Active Reservations</div></div>
            <div><div className="text-2xl font-bold text-teal-600">2,847</div><div className="text-sm text-gray-500">Available SKUs</div></div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Featured Medical Supplies</h2>
          <p className="text-gray-500 mt-1">Premium quality products for healthcare professionals</p>
          <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mx-auto mt-3"></div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl">
            <p className="text-gray-500">No products found. Please seed your database.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{product.sku}</p>
                  
                  {product.warehouses.map((wh) => (
                    <div key={wh.warehouseId} className="flex justify-between items-center py-3 border-t border-gray-100 first:border-t-0">
                      <div>
                        <p className="font-medium text-gray-800">{wh.warehouseName}</p>
                        <p className="text-sm text-green-600">{wh.availableStock} available</p>
                      </div>
                      <button
                        onClick={() => handleReserve(product.id, wh.warehouseId)}
                        disabled={wh.availableStock === 0 || reserving === `${product.id}-${wh.warehouseId}`}
                        className={`px-5 py-2 rounded-lg font-medium transition ${
                          wh.availableStock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : reserving === `${product.id}-${wh.warehouseId}`
                            ? 'bg-teal-400 text-white cursor-wait'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {reserving === `${product.id}-${wh.warehouseId}` ? 'Reserving...' : 'Reserve for 10 min'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-400 mb-4">
            <a href="https://www.allohealth.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400">About</a>
            <a href="https://www.allohealth.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400">Privacy</a>
            <a href="https://www.allohealth.com/blog/sexual-education/terminology" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400">Terms</a>
            <a href="mailto:care@allohealth.care" className="hover:text-teal-400">Contact</a>
          </div>
          <div className="text-xs text-gray-500">© 2022 Allo Health. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
