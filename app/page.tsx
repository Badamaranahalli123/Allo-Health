'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  totalStock: number
  reservedStock: number
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading medical supplies...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>
              <img 
                src="https://media.allohealth.care/allo-logo-v1.png" 
                alt="Allo Health" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h1 style={styles.logo}>Allo Health</h1>
              <p style={styles.tagline}>Inventory Reservation System</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <Link href="/orders" style={styles.ordersLink}>📦 My Orders</Link>
            <div style={styles.badge}>
              <span style={styles.badgeText}>10 min hold</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>Trusted by 500+ healthcare providers</div>
            <h1 style={styles.heroTitle}>Smart Inventory for <span style={styles.heroHighlight}>Better Patient Care</span></h1>
            <p style={styles.heroText}>Real-time stock management with 10-minute reservation holds.</p>
            <div style={styles.heroFeatures}>
              <div style={styles.heroFeature}>⏰ 10 min hold</div>
              <div style={styles.heroFeature}>✓ Secure checkout</div>
              <div style={styles.heroFeature}>🚚 Free delivery</div>
            </div>
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>98.5%</div>
              <div style={styles.statLabel}>Fulfillment Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>142</div>
              <div style={styles.statLabel}>Active Reservations</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>2,847</div>
              <div style={styles.statLabel}>Available SKUs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Medical Supplies</h2>
          <p style={styles.sectionSubtitle}>Premium quality products for healthcare professionals</p>
        </div>
        
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No products found. Please check your database.</p>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.productHeader}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productSku}>{product.sku}</p>
                </div>
                <div style={styles.productBody}>
                  {product.warehouses.map((wh) => (
                    <div key={wh.warehouseId} style={styles.warehouseCard}>
                      {/* Warehouse Name First */}
                      <div style={styles.warehouseHeader}>
                        <span style={styles.warehouseIcon}>🏪</span>
                        <span style={styles.warehouseName}>{wh.warehouseName}</span>
                      </div>
                      
                      {/* Stock Breakdown Box - Under warehouse name */}
                      <div style={styles.stockInfo}>
                        <div style={styles.stockTitle}>📊 Stock Breakdown: Total = Available + Reserved</div>
                        <div style={styles.stockRow}>
                          <span>📦 Total Stock:</span>
                          <span style={styles.stockValue}>{wh.totalStock} units</span>
                        </div>
                        <div style={styles.stockRow}>
                          <span>🔒 Reserved Stock:</span>
                          <span style={styles.stockValueReserved}>{wh.reservedStock} units</span>
                        </div>
                        <div style={styles.stockRow}>
                          <span>✅ Available Stock:</span>
                          <span style={styles.stockValueAvailable}>{wh.availableStock} units</span>
                        </div>
                        <div style={styles.stockFormula}>
                          {wh.totalStock} = {wh.availableStock} + {wh.reservedStock}
                        </div>
                      </div>
                      
                      {/* Reserve Button */}
                      <div style={styles.buttonContainer}>
                        <button
                          onClick={() => handleReserve(product.id, wh.warehouseId)}
                          disabled={wh.availableStock === 0 || reserving === `${product.id}-${wh.warehouseId}`}
                          style={{
                            ...styles.reserveButton,
                            ...(wh.availableStock === 0 ? styles.buttonDisabled : {})
                          }}
                        >
                          {reserving === `${product.id}-${wh.warehouseId}` ? 'Reserving...' : 'Reserve for 10 min'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLinks}>
            <a href="https://www.allohealth.com/about" target="_blank" style={styles.footerLink}>About</a>
            <a href="https://www.allohealth.com/legal/privacy-policy" target="_blank" style={styles.footerLink}>Privacy</a>
            <a href="https://www.allohealth.com/blog/sexual-education/terminology" target="_blank" style={styles.footerLink}>Terms</a>
            <a href="mailto:care@allohealth.care" style={styles.footerLink}>Contact</a>
          </div>
          <div style={styles.copyright}>© 2022 Allo Health. All rights reserved.</div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 30%, #f8fafc 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #ccfbf1',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tagline: {
    fontSize: '11px',
    color: '#6b7280',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  ordersLink: {
    color: '#0f766e',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#ccfbf1',
    padding: '6px 14px',
    borderRadius: '20px',
  },
  badgeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f766e',
  },
  hero: {
    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    color: 'white',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
    gap: '32px',
  },
  heroLeft: {
    flex: 1,
    minWidth: '280px',
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '16px',
    lineHeight: 1.2,
  },
  heroHighlight: {
    color: '#ccfbf1',
  },
  heroText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '24px',
  },
  heroFeatures: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as 'wrap',
  },
  heroFeature: {
    fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  statsGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as 'wrap',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '16px',
    minWidth: '110px',
    textAlign: 'center' as 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.8,
  },
  productsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  sectionHeader: {
    textAlign: 'center' as 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '48px',
    backgroundColor: 'white',
    borderRadius: '16px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  productHeader: {
    padding: '20px 24px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  productSku: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  productBody: {
    padding: '16px',
  },
  warehouseCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  warehouseHeader: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  warehouseIcon: {
    fontSize: '18px',
  },
  warehouseName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#1e293b',
  },
  stockInfo: {
    backgroundColor: '#f1f5f9',
    padding: '14px 16px',
    margin: '12px 16px',
    borderRadius: '10px',
  },
  stockTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '10px',
    textAlign: 'center' as 'center',
  },
  stockRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '5px 0',
  },
  stockValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  stockValueReserved: {
    fontWeight: '600',
    color: '#d97706',
  },
  stockValueAvailable: {
    fontWeight: '600',
    color: '#059669',
  },
  stockFormula: {
    fontSize: '10px',
    color: '#64748b',
    textAlign: 'center' as 'center',
    marginTop: '8px',
    paddingTop: '6px',
    borderTop: '1px dashed #cbd5e1',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: '0 16px 16px 16px',
  },
  reserveButton: {
    width: '100%',
    backgroundColor: '#14b8a6',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    marginTop: '48px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    textAlign: 'center' as 'center',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '20px',
    flexWrap: 'wrap' as 'wrap',
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '13px',
  },
  copyright: {
    fontSize: '12px',
    color: '#6b7280',
    borderTop: '1px solid #374151',
    paddingTop: '20px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#14b8a6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
  },
}
