'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReservationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const [expired, setExpired] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const percentage = (timeLeft / 600) * 100

  const confirmPurchase = async () => {
    setLoading(true)
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
    if (res.status === 410) {
      alert('❌ Reservation expired')
      router.push('/')
    } else if (res.ok) {
      setShowSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  const cancel = async () => {
    setLoading(true)
    await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
    router.push('/')
    setLoading(false)
  }

  if (expired) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.expiredIcon}>⏰</div>
          <h2 style={styles.modalTitle}>Reservation Expired</h2>
          <p style={styles.modalText}>Your hold time has run out.</p>
          <button onClick={() => router.push('/')} style={styles.modalButton}>Back to Shop</button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.modalTitle}>Purchase Confirmed!</h2>
          <p style={styles.modalText}>Your order has been placed successfully.</p>
          <button onClick={() => router.push('/')} style={styles.modalButton}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>🛡️</div>
          <h1 style={styles.title}>Complete Your Purchase</h1>
          <p style={styles.subtitle}>Your item is reserved for 10 minutes</p>
        </div>

        {/* Timer Circle */}
        <div style={styles.timerSection}>
          <div style={styles.circleContainer}>
            <svg style={styles.svg} viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle 
                cx="60" cy="60" r="54" 
                fill="none" 
                stroke="#14b8a6" 
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - percentage / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={styles.timerText}>
              <span style={styles.timeValue}>{formatTime(timeLeft)}</span>
              <span style={styles.timeLabel}>time remaining</span>
            </div>
          </div>
          <div style={styles.warningBox}>
            <span>⚠️</span>
            <span style={styles.warningText}>Don't close this page - your reservation will expire!</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.actions}>
          <button
            onClick={confirmPurchase}
            disabled={loading}
            style={styles.confirmButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            {loading ? 'Processing...' : '✓ Confirm Order'}
          </button>
          <button
            onClick={cancel}
            disabled={loading}
            style={styles.cancelButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          >
            Cancel Reservation
          </button>
        </div>

        {/* Footer Note */}
        <div style={styles.footerNote}>
          ⏰ Reservation expires automatically after 10 minutes
        </div>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '16px',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    padding: '32px 24px',
    textAlign: 'center' as 'center',
  },
  headerIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#ccfbf1',
    marginTop: '8px',
  },
  timerSection: {
    padding: '32px 24px',
    textAlign: 'center' as 'center',
  },
  circleContainer: {
    position: 'relative' as 'relative',
    width: '200px',
    height: '200px',
    margin: '0 auto',
  },
  svg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  timerText: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as 'center',
  },
  timeValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'monospace',
    display: 'block',
  },
  timeLabel: {
    fontSize: '11px',
    color: '#6b7280',
  },
  warningBox: {
    marginTop: '24px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left' as 'left',
  },
  warningText: {
    fontSize: '12px',
    color: '#92400e',
  },
  actions: {
    padding: '0 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '12px',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
    color: '#374151',
    border: '1px solid #e5e7eb',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footerNote: {
    backgroundColor: '#f9fafb',
    padding: '14px',
    textAlign: 'center' as 'center',
    fontSize: '11px',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px 32px',
    textAlign: 'center' as 'center',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  modalText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  modalButton: {
    backgroundColor: '#14b8a6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  expiredIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
}
