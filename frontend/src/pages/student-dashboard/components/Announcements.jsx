import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const severityStyles = {
  info: 'text-primary bg-primary/10',
  warning: 'text-warning bg-warning/10',
  critical: 'text-error bg-error/10'
};

const Announcements = () => {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

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

        const notifications = res.data?.data?.notifications || [];

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
      } finally {
        setLoading(false);
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

      {/* HEADER */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon name="Info" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Announcements</h3>
            <p className="text-xs text-muted-foreground">
              {items.length} active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setItems([]);
            }}
          >
            Clear All
          </Button>

          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={18} />
        </div>
      </button>

      {/* CONTENT */}
      <div className={`${isOpen ? 'max-h-[2000px]' : 'max-h-0'} overflow-hidden transition-all`}>
        <div className="p-4 space-y-3">

          {/* ✅ LOADING */}
          {loading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}

          {/* ✅ EMPTY */}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No announcements</p>
          )}

          {/* ✅ DATA */}
          {items.map(item => (
            <div key={item.id} className="border rounded-md p-3 flex justify-between">

              <div className="flex space-x-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${severityStyles[item.severity]}`}>
                  <Icon name={item.severity === 'critical' ? 'AlertTriangle' : 'Info'} size={16} />
                </div>

                <div>
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {item.body}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => dismissItem(item.id)}
              >
                <Icon name="X" size={14} />
              </Button>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Announcements;