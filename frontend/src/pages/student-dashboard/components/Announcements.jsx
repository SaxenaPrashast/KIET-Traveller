import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Announcements component
 * - Displays a list of notices
 * - Announcements are dismissible locally
 * - Card is collapsible
 *
 * Replace the `mockAnnouncements` with an API fetch when your backend is ready.
 */

const severityStyles = {
  info: 'text-primary bg-primary/10',
  warning: 'text-warning bg-warning/10',
  critical: 'text-error bg-error/10'
};

const Announcements = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {

    const fetchAnnouncements = async () => {
  
      try {
  
        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
  
        const notifications = res.data.data.notifications;
  
        const formatted = notifications.map(n => ({
          id: n._id,
          title: n.title,
          body: n.message,
          severity: n.priority === "high" ? "critical" : "info",
          date: n.createdAt
        }));
  
        setItems(formatted);
  
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
  
    };
  
    if (token) {
      fetchAnnouncements();
    }
  
  }, [token]);

  const dismissItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-smooth"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
            <Icon name="Info" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground leading-none">Announcements</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{items.length} active</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setItems([]); }}>
            Clear All
          </Button>
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={18} className="text-muted-foreground" />
        </div>
      </button>

      {/* Content (collapsible) */}
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3">No announcements</div>
          ) : items.map(item => (
            <div key={item.id} className="bg-muted/5 border border-border rounded-md p-3 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${severityStyles[item.severity] || 'text-muted-foreground bg-muted/10'}`}>
                  {/* small icon */}
                  <Icon name={item.severity === 'critical' ? 'AlertTriangle' : 'Info'} size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground break-words">{item.title}</h4>
                    <span className="text-xs text-muted-foreground ml-3">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words whitespace-normal">{item.body}</p>
                </div>
              </div>

              <div className="flex items-center ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissItem(item.id)}
                  className="text-muted-foreground"
                  aria-label="Dismiss announcement"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
