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
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reservations?status=confirmed')
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← Back to Shop</Link>
        <h1 style={styles.title}>My Orders</h1>
        <div style={styles.headerSpacer}></div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h2 style={styles.emptyTitle}>No orders yet</h2>
            <p style={styles.emptyText}>You haven't placed any orders yet.</p>
            <Link href="/" style={styles.shopButton}>Start Shopping →</Link>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            <div style={styles.statsBar}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{orders.length}</span>
                <span style={styles.statLabel}>Total Orders</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>✓</span>
                <span style={styles.statLabel}>All Confirmed</span>
              </div>
            </div>

            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>Order #{order.id.slice(-8)}</span>
                    <span style={styles.orderStatus}>✓ Confirmed</span>
                  </div>
                  <span style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div style={styles.orderBody}>
                  <div style={styles.productInfo}>
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
                      <span style={styles.detailLabel}>Delivery</span>
                      <span style={styles.detailValue}>Express • Tomorrow</span>
                    </div>
                  </div>
                </div>
                
                <div style={styles.orderFooter}>
                  <span style={styles.trackingStatus}>🚚 Order confirmed • Processing for shipment</span>
                </div>
              </div>
            ))}
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
    backgroundColor: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  backLink: {
    color: '#14b8a6',
    textDecoration: 'none',
    fontSize: '14px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#f9fafb',
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
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
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
    fontSize: '14px',
    fontWeight: '500',
  },
  ordersGrid: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px',
  },
  statsBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  },
  statItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px 24px',
    flex: 1,
    textAlign: 'center' as 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#14b8a6',
    display: 'block',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    backgroundColor: '#f9fafb',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
    gap: '8px',
  },
  orderId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginRight: '12px',
  },
  orderStatus: {
    fontSize: '12px',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  orderDate: {
    fontSize: '12px',
    color: '#6b7280',
  },
  orderBody: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    gap: '20px',
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  productIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#ccfbf1',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  productSku: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
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