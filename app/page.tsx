'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  location?: string
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
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
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
      
      {/* Header - Allo Health Branding */}
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
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const span = document.createElement('span');
                      span.className = 'text-2xl';
                      span.textContent = '🏥';
                      parent.appendChild(span);
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

      {/* Hero Section - Healthcare Focused */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4 backdrop-blur-sm">
                <span>❤️</span>
                Trusted by 500+ healthcare providers
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Smart Inventory for
                <span className="block text-teal-200">Better Patient Care</span>
              </h1>
              <p className="text-teal-100 mb-6 text-lg">
                Real-time stock management with 10-minute reservation holds. 
                Ensuring critical supplies reach those who need them most.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span>⏰</span>
                  <span className="text-sm">10 min exclusive hold</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span>🛡️</span>
                  <span className="text-sm">Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span>🚚</span>
                  <span className="text-sm">Express delivery</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                  <span className="text-sm">Today's Metrics</span>
                  <span>📈</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Active Reservations</span>
                    <span className="font-bold">142</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-teal-300 h-1.5 rounded-full w-2/3"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order Fulfillment Rate</span>
                    <span className="font-bold">98.5%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-teal-300 h-1.5 rounded-full w-[98%]"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available SKUs</span>
                    <span className="font-bold">2,847</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-teal-300 h-1.5 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Featured Medical Supplies</h2>
          <p className="text-gray-500 mt-1">Premium quality products for healthcare professionals</p>
          <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mx-auto mt-3"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product, idx) => (
            <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-teal-100">
              
              {/* Product Header */}
              <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
                <div className="absolute top-3 right-3 bg-teal-500/20 rounded-full px-2 py-1">
                  <span className="text-xs text-teal-300 font-medium">Medical Grade</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/20 rounded-xl p-2.5">
                    <span className="text-2xl">{product.name.includes('Blood Pressure') ? '🩺' : '💓'}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-yellow-400 text-sm">★★★★☆</span>
                  <span className="text-xs text-gray-400 ml-1">(128 reviews)</span>
                </div>
              </div>

              {/* Price Section (Mock data for professional look) */}
              <div className="px-6 pt-4 bg-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">{product.name.includes('Blood Pressure') ? '₹2,999' : '₹1,499'}</span>
                  <span className="text-gray-400 line-through text-sm">{product.name.includes('Blood Pressure') ? '₹4,999' : '₹2,499'}</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">40% OFF</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pb-3 border-b border-gray-100">
                  <span>🚚 Free Delivery</span>
                  <span>•</span>
                  <span className="text-green-600">Tomorrow by 10 AM</span>
                </div>
              </div>

              {/* Warehouse Options */}
              <div className="p-6 space-y-3">
                {product.warehouses.map((wh) => {
                  const isLowStock = wh.availableStock <= 5 && wh.availableStock > 0
                  const isOutOfStock = wh.availableStock === 0
                  const isReserving = reserving === `${product.id}-${wh.warehouseId}`
                  
                  return (
                    <div
                      key={wh.warehouseId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{wh.warehouseName}</p>
                        {isOutOfStock ? (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="text-xs text-amber-600 font-medium">⚠️ Only {wh.availableStock} left!</span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">✅ {wh.availableStock} units available</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleReserve(product.id, wh.warehouseId)}
                        disabled={isOutOfStock || !!isReserving}
                        className={`
                          px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm
                          ${isOutOfStock 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-md hover:scale-105'
                          }
                        `}
                      >
                        {isReserving ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Reserving...</span>
                          </>
                        ) : (
                          <>
                            <span>⏰</span>
                            <span>Reserve</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Trust Badges */}
              <div className="px-6 pb-4 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500 bg-gray-50">
                <div className="flex items-center gap-1">✅ ISO 13485</div>
                <div className="flex items-center gap-1">✅ CE Certified</div>
                <div className="flex items-center gap-1">✅ 2 Year Warranty</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Features Banner */}
      <div className="bg-white py-10 mt-4 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
              <p className="font-semibold text-gray-800 text-sm">ISO Certified</p>
              <p className="text-xs text-gray-400">Quality assured</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-2xl">🚚</div>
              <p className="font-semibold text-gray-800 text-sm">Free Shipping</p>
              <p className="text-xs text-gray-400">On all orders</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-2xl">🔒</div>
              <p className="font-semibold text-gray-800 text-sm">Secure Payment</p>
              <p className="text-xs text-gray-400">256-bit SSL</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-2xl">🔄</div>
              <p className="font-semibold text-gray-800 text-sm">Easy Returns</p>
              <p className="text-xs text-gray-400">7 days policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://media.allohealth.care/allo-logo-v1.png" 
                  alt="Allo Health" 
                  className="w-6 h-6 object-contain brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="font-semibold">Allo Health</span>
              </div>
              <p className="text-sm text-gray-400">Smart inventory for better healthcare.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Shop</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="hover:text-teal-400 cursor-pointer">Medical Equipment</li>
                <li className="hover:text-teal-400 cursor-pointer">Diagnostics</li>
                <li className="hover:text-teal-400 cursor-pointer">Accessories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Support</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="hover:text-teal-400 cursor-pointer">Help Center</li>
                <li className="hover:text-teal-400 cursor-pointer">Returns Policy</li>
                <li className="hover:text-teal-400 cursor-pointer">Shipping Info</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Company</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="hover:text-teal-400 cursor-pointer">About Allo</li>
                <li className="hover:text-teal-400 cursor-pointer">Careers</li>
                <li className="hover:text-teal-400 cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            <div className="flex justify-center gap-6 mb-3">
              <a href="https://www.allohealth.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">About</a>
              <a href="https://www.allohealth.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">Privacy</a>
              <a href="https://www.allohealth.com/blog/sexual-education/terminology" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">Terms</a>
              <a href="mailto:care@allohealth.care" className="hover:text-teal-400 transition">Contact</a>
            </div>
            <p>© 2022 Allo Health. Smart inventory for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
