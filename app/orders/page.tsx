'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string
  product: { name: string; sku: string }
  warehouse: { name: string; location: string }
  quantity: number
  createdAt: string
  status: string
  expiresAt?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    fetch('/api/reservations?status=confirmed')
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
    
    // Auto-refresh every 5 seconds to show state changes
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: '#059669', bg: '#d1fae5', text: '✓ Confirmed', label: 'Stock permanently deducted' }
      case 'pending':
        return { color: '#d97706', bg: '#fef3c7', text: '⏳ Pending', label: 'Awaiting confirmation' }
      case 'released':
        return { color: '#dc2626', bg: '#fee2e2', text: '✗ Released', label: 'Stock released back' }
      case 'expired':
        return { color: '#6b7280', bg: '#f3f4f6', text: '⌛ Expired', label: 'Reservation timed out' }
      default:
        return { color: '#6b7280', bg: '#f3f4f6', text: status, label: status }
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← Back to Shop</Link>
        <h1 style={styles.title}>My Orders</h1>
        <div style={styles.headerSpacer}></div>
      </div>

      <div style={styles.content}>
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h2 style={styles.emptyTitle}>No orders yet</h2>
            <p style={styles.emptyText}>You haven't placed any orders yet.</p>
            <Link href="/" style={styles.shopButton}>Start Shopping →</Link>
          </div>
        ) : (
          <div style={styles.ordersList}>
            <div style={styles.autoRefreshNote}>
              🔄 Auto-refreshing every 5 seconds to show real-time state changes
            </div>
            {orders.map((order) => {
              const badge = getStatusBadge(order.status)
              return (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div style={styles.orderIdSection}>
                      <span style={styles.orderId}>Order #{order.id.slice(-8)}</span>
                      <span style={{ ...styles.orderStatus, backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                    </div>
                    <span style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={styles.orderBody}>
                    <div style={styles.productSection}>
                      <div style={styles.productIcon}>🏥</div>
                      <div>
                        <h3 style={styles.productName}>{order.product.name}</h3>
                        <p style={styles.productSku}>SKU: {order.product.sku}</p>
                      </div>
                    </div>
                    <div style={styles.orderDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Warehouse</span>
                        <span style={styles.detailValue}>{order.warehouse.name}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Quantity</span>
                        <span style={styles.detailValue}>{order.quantity}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Status</span>
                        <span style={styles.detailValue}>{badge.label}</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.orderFooter}>
                    <span style={styles.trackingStatus}>
                      {order.status === 'confirmed' ? '✓ Order confirmed • Stock permanently deducted' : 
                       order.status === 'pending' ? '⏳ Waiting for confirmation • Stock reserved' :
                       '✗ Reservation released • Stock available again'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '900px',
    margin: '0 auto',
    borderBottom: '1px solid #e5e7eb',
  },
  backLink: {
    color: '#14b8a6',
    textDecoration: 'none',
    fontSize: '14px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  headerSpacer: {
    width: '80px',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px',
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
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: '24px',
  },
  shopButton: {
    display: 'inline-block',
    backgroundColor: '#14b8a6',
    color: 'white',
    textDecoration: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px',
  },
  autoRefreshNote: {
    textAlign: 'center' as 'center',
    fontSize: '11px',
    color: '#6b7280',
    backgroundColor: '#f1f5f9',
    padding: '8px',
    borderRadius: '8px',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    gap: '8px',
  },
  orderIdSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orderId: {
    fontWeight: '600',
    fontSize: '14px',
  },
  orderStatus: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  orderDate: {
    color: '#6b7280',
    fontSize: '12px',
  },
  orderBody: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    gap: '20px',
  },
  productSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  productIcon: {
    fontSize: '32px',
  },
  productName: {
    fontWeight: '600',
    marginBottom: '4px',
  },
  productSku: {
    fontSize: '12px',
    color: '#6b7280',
  },
  orderDetails: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap' as 'wrap',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase' as 'uppercase',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  orderFooter: {
    backgroundColor: '#f9fafb',
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
  },
  trackingStatus: {
    fontSize: '12px',
    color: '#6b7280',
  },
}
