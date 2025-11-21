import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import LogoutButton from '../../components/LogoutButton';
import LiveBusTrackingCard from './components/LiveBusTrackingCard';
import QuickActionsSection from './components/QuickActionsSection';
import UpcomingScheduleCard from './components/UpcomingScheduleCard';
import PeerCoordinationSection from './components/PeerCoordinationSection';
import ChatbotWidget from './components/ChatbotWidget';
import Announcements from './components/Announcements';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Welcome back, {user?.firstName || 'Student'}!
                  </h1>
                  <p className="text-muted-foreground">
                    Track your buses, coordinate with peers, and stay updated with real-time transportation information.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">3 buses active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Live tracking enabled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-muted-foreground">2 route updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <LiveBusTrackingCard />
              <UpcomingScheduleCard />

              {/* Emergency Contact (fixed position & spacing) */}
              <div className="max-w-sm">
                <QuickActionsSection />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <Announcements />
              <PeerCoordinationSection />
            </div>

          </div>

          {/* Mobile Stats Section */}
          <div className="mt-8 lg:hidden">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-muted-foreground">Active Buses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">5</div>
                  <div className="text-xs text-muted-foreground">Routes Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">2</div>
                  <div className="text-xs text-muted-foreground">Notifications</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Chatbot */}
      <ChatbotWidget />
    </div>
  );
};

export default StudentDashboard;
