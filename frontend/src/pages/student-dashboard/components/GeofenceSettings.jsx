import React, { useState, useEffect } from 'react';
import { useGeofence } from '../../../contexts/GeofenceContext';

const GeofenceSettings = () => {
  const {
    config,
    configLoading,
    updateConfig,
    availableStops,
    stopsLoading,
    fetchStops,
    isConnected
  } = useGeofence();

  const [localEnabled, setLocalEnabled] = useState(false);
  const [localRadius, setLocalRadius] = useState(500);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local state with config
  useEffect(() => {
    if (!configLoading) {
      setLocalEnabled(config.enabled || false);
      setLocalRadius(config.radius || 500);
      setSelectedStopId(config.assignedStopId || '');
    }
  }, [config, configLoading]);

  // Fetch stops when expanded
  useEffect(() => {
    if (isExpanded && availableStops.length === 0) {
      fetchStops();
    }
  }, [isExpanded, availableStops.length, fetchStops]);

  const radiusOptions = [
    { value: 200, label: '200m', desc: 'Very close' },
    { value: 500, label: '500m', desc: 'Default' },
    { value: 1000, label: '1 km', desc: 'Medium' },
    { value: 2000, label: '2 km', desc: 'Wide' },
    { value: 5000, label: '5 km', desc: 'Maximum' },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const selectedStop = availableStops.find(s => s.stopId === selectedStopId);

      await updateConfig({
        enabled: localEnabled,
        radius: localRadius,
        assignedStopId: selectedStopId || null,
        assignedRouteId: selectedStop?.routeId || null,
        assignedStopName: selectedStop?.stopName || null,
      });

      setSaveMessage({ type: 'success', text: 'Geofence settings saved!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    localEnabled !== (config.enabled || false) ||
    localRadius !== (config.radius || 500) ||
    selectedStopId !== (config.assignedStopId || '');

  // Group stops by route
  const groupedStops = availableStops.reduce((acc, stop) => {
    const key = `${stop.routeNumber} - ${stop.routeName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(stop);
    return acc;
  }, {});

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '1rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '0.75rem',
            background: localEnabled
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'rgba(100, 116, 139, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={localEnabled ? '#fff' : '#94a3b8'} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#e2e8f0',
            }}>
              Geofence Alerts
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}>
              {localEnabled
                ? `Active · ${radiusOptions.find(r => r.value === localRadius)?.label || localRadius + 'm'} range`
                : 'Get notified when buses approach your stop'
              }
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Connection indicator */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#22c55e' : '#ef4444',
            boxShadow: isConnected ? '0 0 6px rgba(34, 197, 94, 0.5)' : '0 0 6px rgba(239, 68, 68, 0.5)',
          }} />
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expandable settings */}
      {isExpanded && (
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid rgba(99, 102, 241, 0.1)',
        }}>
          {/* Enable toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0',
          }}>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
              Enable Alerts
            </span>
            <button
              onClick={() => setLocalEnabled(!localEnabled)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '999px',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                background: localEnabled
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(100, 116, 139, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#fff',
                transform: localEnabled ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          {localEnabled && (
            <>
              {/* Stop selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}>
                  📍 Your Bus Stop
                </label>
                <select
                  value={selectedStopId}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  disabled={stopsLoading}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.6rem',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2rem',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)'}
                >
                  <option value="">
                    {stopsLoading ? 'Loading stops...' : 'Select your stop'}
                  </option>
                  {Object.entries(groupedStops).map(([routeLabel, stops]) => (
                    <optgroup key={routeLabel} label={`Route ${routeLabel}`}>
                      {stops.map((stop) => (
                        <option key={stop.stopId} value={stop.stopId}>
                          {stop.stopName}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Radius selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}>
                  📡 Alert Radius
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0.35rem',
                }}>
                  {radiusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLocalRadius(option.value)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '0.5rem',
                        border: localRadius === option.value
                          ? '1.5px solid #6366f1'
                          : '1px solid rgba(100, 116, 139, 0.3)',
                        background: localRadius === option.value
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(15, 23, 42, 0.5)',
                        color: localRadius === option.value ? '#a5b4fc' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: localRadius === option.value ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                      }}
                    >
                      <div>{option.label}</div>
                      <div style={{
                        fontSize: '0.6rem',
                        opacity: 0.7,
                        marginTop: '0.15rem',
                      }}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '0.6rem',
                border: 'none',
                background: saving
                  ? 'rgba(99, 102, 241, 0.3)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!saving) e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {saving ? '⏳ Saving...' : '✅ Save Settings'}
            </button>
          )}

          {/* Save message */}
          {saveMessage && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              textAlign: 'center',
              background: saveMessage.type === 'success'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              color: saveMessage.type === 'success' ? '#86efac' : '#fca5a5',
              border: `1px solid ${saveMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}>
              {saveMessage.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeofenceSettings;
