'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string
  product: { name: string; sku: string }
  warehouse: { name: string }
  quantity: number
  createdAt: string
  status: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      // Fetch ALL reservations (not just confirmed)
      const res = await fetch('/api/reservations')
      const data = await res.json()
      console.log('📦 Orders from API:', data)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>← Back to Shop</Link>
          <h1 style={styles.title}>My Orders</h1>
          <div style={styles.headerSpacer}></div>
        </div>
        <div style={styles.content}>
          <p>Loading orders...</p>
        </div>
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
            {orders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <span style={styles.orderId}>Order #{order.id.slice(-8)}</span>
                  <span style={{
                    ...styles.orderStatus,
                    backgroundColor: order.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                    color: order.status === 'confirmed' ? '#059669' : '#d97706',
                  }}>
                    {order.status === 'confirmed' ? '✓ Confirmed' : order.status}
                  </span>
                  <span style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.orderBody}>
                  <div>
                    <h3 style={styles.productName}>{order.product.name}</h3>
                    <p style={styles.productSku}>SKU: {order.product.sku}</p>
                  </div>
                  <div>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Warehouse:</strong> {order.warehouse.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
    gap: '16px',
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
    gap: '16px',
  },
  productName: {
    fontWeight: '600',
    marginBottom: '4px',
  },
  productSku: {
    fontSize: '12px',
    color: '#6b7280',
  },
}
