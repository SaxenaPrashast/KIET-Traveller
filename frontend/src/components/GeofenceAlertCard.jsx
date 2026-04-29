import React, { useState, useEffect } from 'react';
import { useGeofence } from '../contexts/GeofenceContext';

const GeofenceAlertCard = () => {
  const { alerts, dismissAlert, clearAlerts, config } = useGeofence();
  const [isExpanded, setIsExpanded] = useState(true);
  const [animatingAlertId, setAnimatingAlertId] = useState(null);

  // Animate new alerts
  useEffect(() => {
    if (alerts.length > 0) {
      setAnimatingAlertId(alerts[0].id);
      setIsExpanded(true);
      const timer = setTimeout(() => setAnimatingAlertId(null), 600);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (!config.enabled || alerts.length === 0) return null;

  const getDistanceLabel = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getUrgencyColor = (distance) => {
    if (distance <= 200) return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#fca5a5', label: 'Arriving!' };
    if (distance <= 500) return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fcd34d', label: 'Very Close' };
    if (distance <= 1000) return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#93c5fd', label: 'Approaching' };
    return { bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e', text: '#86efac', label: 'Nearby' };
  };

  const getProgressWidth = (distance, maxRadius) => {
    const progress = Math.max(0, Math.min(100, ((maxRadius - distance) / maxRadius) * 100));
    return `${progress}%`;
  };

  return (
    <div style={{
      position: 'relative',
      marginBottom: '1rem',
    }}>
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          borderRadius: isExpanded ? '1rem 1rem 0 0' : '1rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Pulsing radar icon */}
          <div style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.3)',
              animation: 'geofencePulse 2s ease-out infinite',
            }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <span style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#c7d2fe',
              letterSpacing: '0.02em',
            }}>
              🚌 Bus Alert
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: '#a5b4fc',
              marginLeft: '0.5rem',
              fontWeight: 500,
            }}>
              {alerts.length} active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {alerts.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearAlerts(); }}
              style={{
                fontSize: '0.7rem',
                color: '#a5b4fc',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.4)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
            >
              Clear All
            </button>
          )}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Alert cards */}
      {isExpanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          borderRadius: '0 0 1rem 1rem',
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderTop: 'none',
        }}>
          {alerts.map((alert, index) => {
            const urgency = getUrgencyColor(alert.distance);
            const isAnimating = animatingAlertId === alert.id;

            return (
              <div
                key={alert.id}
                style={{
                  padding: '1rem 1.25rem',
                  background: urgency.bg,
                  borderBottom: index < alerts.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none',
                  animation: isAnimating ? 'geofenceSlideIn 0.5s ease-out' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Animated proximity progress bar */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '3px',
                  width: getProgressWidth(alert.distance, config.radius || 500),
                  background: `linear-gradient(90deg, ${urgency.border}, ${urgency.text})`,
                  borderRadius: '0 2px 0 0',
                  transition: 'width 1s ease',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Bus info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: urgency.border,
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        letterSpacing: '0.05em',
                      }}>
                        {urgency.label}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#f1f5f9',
                      }}>
                        Bus {alert.busNumber}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                      }}>
                        Route {alert.routeNumber}
                      </span>
                    </div>

                    {/* Stop and distance info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span style={{ fontSize: '0.8rem', color: urgency.text, fontWeight: 600 }}>
                          ~{alert.eta} min
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
                          {getDistanceLabel(alert.distance)} from {alert.stop?.name}
                        </span>
                      </div>

                      {alert.busOccupancy > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
                            {alert.busOccupancy}/{alert.busCapacity} seats
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes geofencePulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes geofenceSlideIn {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GeofenceAlertCard;
