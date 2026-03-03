import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Calendar, Bell, MapPin, ChevronRight, Clock,
  Trophy, Users, ArrowLeft, Zap, Volume2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Mock data
const events = [
  { id: 1, sport: "Football", teams: "Sénégal vs Cameroun", time: "18:00", venue: "Stade Abdoulaye Wade", status: "live", score: "2 - 1" },
  { id: 2, sport: "Basketball", teams: "Sénégal vs Mali", time: "20:30", venue: "Dakar Arena", status: "upcoming" },
  { id: 3, sport: "Athlétisme", teams: "100m Finale", time: "21:00", venue: "Stade LSS", status: "upcoming" },
  { id: 4, sport: "Natation", teams: "200m Libre", time: "14:00", venue: "Piscine Olympique", status: "finished", score: "Terminé" },
];

const notifications = [
  { id: 1, title: "⚽ BUT ! Sénégal 2 - 1", time: "il y a 3 min", urgent: true },
  { id: 2, title: "🏀 Match Basketball dans 1h", time: "il y a 15 min", urgent: false },
  { id: 3, title: "📍 Buvette B2 — file d'attente courte", time: "il y a 20 min", urgent: false },
  { id: 4, title: "🎫 Votre billet a été vérifié", time: "il y a 1h", urgent: false },
];

const tabs = [
  { id: "schedule", label: "Programme", icon: Calendar },
  { id: "ticket", label: "Mon billet", icon: QrCode },
  { id: "map", label: "Guide", icon: MapPin },
  { id: "notifications", label: "Alertes", icon: Bell },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="glass-card sticky top-0 z-50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold">Fan 360</h1>
              <p className="text-xs text-muted-foreground">Bienvenue, Amadou 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
            </div>
          </div>
        </div>
      </header>

      {/* Live banner */}
      <div className="container mx-auto px-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 border-primary/30 glow-primary"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              EN DIRECT
            </span>
            <span className="text-xs text-muted-foreground">Stade Abdoulaye Wade</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-display text-xl font-bold">Sénégal vs Cameroun</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> 72' • Football
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-gradient">2 - 1</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab content */}
      <div className="container mx-auto px-6 mt-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl font-bold mb-4">Programme du jour</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-sm">{event.teams}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{event.sport}</span>
                        <span>•</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {event.status === "live" ? (
                        <span className="text-sm font-bold text-gradient">{event.score}</span>
                      ) : event.status === "finished" ? (
                        <span className="text-xs text-muted-foreground">{event.score}</span>
                      ) : (
                        <span className="text-sm font-semibold text-foreground">{event.time}</span>
                      )}
                      {event.status === "live" && (
                        <div className="flex items-center gap-1 text-xs text-destructive mt-0.5">
                          <Volume2 className="h-3 w-3" /> Live
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "ticket" && (
            <motion.div key="ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl font-bold mb-4">Mon billet</h2>
              <div className="glass-card rounded-2xl p-6 text-center glow-primary max-w-sm mx-auto">
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground">BILLET #FAN-2026-4892</span>
                </div>
                <div className="bg-foreground/5 rounded-xl p-8 mb-6">
                  <QrCode className="h-32 w-32 mx-auto text-primary" strokeWidth={1} />
                </div>
                <div className="font-display text-lg font-bold">Amadou Diallo</div>
                <div className="text-sm text-muted-foreground mt-1">Tribune Est — Rang 12, Siège 45</div>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> 15 Mars 2026</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 18:00</span>
                </div>
                <div className="mt-4 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium inline-block">
                  ✓ Billet vérifié
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl font-bold mb-4">Guide du site</h2>
              <div className="space-y-3">
                {[
                  { name: "Entrée principale", dist: "Vous y êtes", icon: MapPin, color: "text-success" },
                  { name: "Buvette B2", dist: "120m — File courte", icon: Zap, color: "text-warning" },
                  { name: "Boutique officielle", dist: "200m", icon: Users, color: "text-info" },
                  { name: "Tribune Est", dist: "80m — Votre place", icon: ChevronRight, color: "text-primary" },
                ].map((place) => (
                  <div key={place.name} className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <place.icon className={`h-5 w-5 ${place.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm">{place.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{place.dist}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div key="notifs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl font-bold mb-4">Notifications</h2>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`glass-card rounded-xl p-4 flex items-center gap-4 ${notif.urgent ? "border-primary/30" : ""}`}
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${notif.urgent ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{notif.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{notif.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
        <div className="container mx-auto flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
