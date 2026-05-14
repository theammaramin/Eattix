import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, UtensilsCrossed, TrendingUp, Plus } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { getEvents } from "../../services/eventService";
import { getStallsByEvent } from "../../services/stallService";
import { formatDate, getStatusColor, capitalize } from "../../utils/formatters";
import styles from "./OrganizerDashboard.module.css";

const OrganizerDashboard = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(async (evs) => {
      const orgEvents = evs.filter((e) => e.organizerId === user?.id);
      setEvents(orgEvents);
      let pending = 0;
      await Promise.all(
        orgEvents.map(async (ev) => {
          const stalls = await getStallsByEvent(ev.id);
          pending += stalls.filter((s) => s.status === "pending").length;
        }),
      );
      setPendingCount(pending);
      setLoading(false);
    });
  }, [user]);

  const upcoming = events.filter((e) => e.status === "upcoming");
  const totalStalls = events.reduce((s, e) => s + e.stallCount, 0);

  const stats = [
    {
      label: "My Events",
      value: events.length,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Upcoming",
      value: upcoming.length,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Stalls",
      value: totalStalls,
      icon: UtensilsCrossed,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Pending Applications",
      value: pendingCount,
      icon: Calendar,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.pageTitle}>Organizer Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome, {user?.name.split(" ")[0]}
          </p>
        </div>
        <div className={styles.topActions}>
          <Link to="/organizer/stalls" className="btn-outline text-sm">
            Manage Stalls
          </Link>
          <Link
            to="/organizer/events/new"
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" /> New Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={`${styles.statIconWrap} ${color}`}>
              <Icon className={styles.statIcon} />
            </div>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className={styles.pendingBanner}>
          <div className={styles.pendingBannerLeft}>
            <div className={styles.pendingBadge}>
              <span className={styles.pendingBadgeNum}>{pendingCount}</span>
            </div>
            <div>
              <p className={styles.pendingTitle}>
                Stall applications pending review
              </p>
              <p className={styles.pendingSubtitle}>
                Review and approve vendor applications
              </p>
            </div>
          </div>
          <Link to="/organizer/stalls" className={styles.pendingBtn}>
            Review Now
          </Link>
        </div>
      )}

      {loading ? (
        <div className={styles.eventsGrid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <>
          <h2 className={styles.eventsHeader}>My Events</h2>
          {events.length === 0 ? (
            <div className={styles.emptyCard}>
              <Calendar className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No events yet</h3>
              <Link to="/organizer/events/new" className="btn-primary">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/organizer/events/${event.id}`}
                  className={styles.eventCardLink}
                >
                  <div className={styles.eventCardImg}>
                    <img
                      src={event.image}
                      alt={event.title}
                      className={styles.eventCardImgEl}
                    />
                  </div>
                  <div className={styles.eventCardBody}>
                    <div className={styles.eventCardBadgeRow}>
                      <span className={`badge ${getStatusColor(event.status)}`}>
                        {capitalize(event.status)}
                      </span>
                    </div>
                    <h3 className={styles.eventCardTitle}>{event.title}</h3>
                    <p className={styles.eventCardDate}>
                      {formatDate(event.date)}
                    </p>
                    <p className={styles.eventCardStallCount}>
                      {event.stallCount} stalls
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                to="/organizer/events/new"
                className={`group ${styles.addEventCard}`}
              >
                <div className={styles.addEventCardContent}>
                  <Plus className={styles.addEventIcon} />
                  <span className={styles.addEventLabel}>Add New Event</span>
                </div>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerDashboard;
