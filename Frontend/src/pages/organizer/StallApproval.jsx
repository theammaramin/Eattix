import { useState, useEffect } from "react";
import { Check, X, Star, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { getEvents } from "../../services/eventService";
import {
  getStallsByEvent,
  updateStallStatus,
} from "../../services/stallService";
import useAuthStore from "../../store/authStore";
import { getStatusColor, capitalize } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./StallApproval.module.css";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

const StallApproval = () => {
  const { user } = useAuthStore();
  const [stallsWithEvent, setStallsWithEvent] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const events = await getEvents();
    const orgEvents = events.filter((e) => e.organizerId === user?.id);
    const allStalls = [];
    await Promise.all(
      orgEvents.map(async (ev) => {
        const stalls = await getStallsByEvent(ev.id);
        stalls.forEach((s) => allStalls.push({ ...s, eventTitle: ev.title }));
      }),
    );
    setStallsWithEvent(allStalls);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadAll();
  }, [user]);

  const handleApprove = async (stall) => {
    try {
      await updateStallStatus(stall.id, "approved");
      setStallsWithEvent((prev) =>
        prev.map((s) => (s.id === stall.id ? { ...s, status: "approved" } : s)),
      );
      toast.success(`${stall.name} approved!`);
    } catch {
      toast.error("Failed to approve stall");
    }
  };

  const handleReject = async (stall) => {
    try {
      await updateStallStatus(stall.id, "rejected");
      setStallsWithEvent((prev) =>
        prev.map((s) => (s.id === stall.id ? { ...s, status: "rejected" } : s)),
      );
      toast.success(`${stall.name} rejected`);
    } catch {
      toast.error("Failed to reject stall");
    }
  };

  const filtered = stallsWithEvent.filter(
    (s) => filter === "all" || s.status === filter,
  );

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Stall Management</h1>
          <p className={styles.subtitle}>
            Review and approve vendor applications
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {STATUS_TABS.map((tab) => {
          const count =
            tab === "all"
              ? stallsWithEvent.length
              : stallsWithEvent.filter((s) => s.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                styles.filterTab,
                filter === tab && styles.filterTabActive,
              )}
            >
              {tab}
              {count > 0 && (
                <span
                  className={cn(
                    styles.tabCount,
                    filter === tab
                      ? styles.tabCountActive
                      : tab === "pending"
                        ? styles.tabCountPending
                        : undefined,
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.skeletonList}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyEmoji}>�</p>
          <p className={styles.emptyText}>
            No stalls with status &ldquo;{filter}&rdquo;
          </p>
        </div>
      ) : (
        <div className={styles.stallList}>
          {filtered.map((stall) => (
            <div key={stall.id} className={styles.stallCard}>
              <img
                src={stall.image}
                alt={stall.name}
                className={styles.stallImg}
              />
              <div className={styles.stallBody}>
                <div className={styles.stallNameRow}>
                  <h3 className={styles.stallName}>{stall.name}</h3>
                  <span className={`badge ${getStatusColor(stall.status)}`}>
                    {capitalize(stall.status)}
                  </span>
                </div>
                <p className={styles.stallEvent}>{stall.eventTitle}</p>
                <p className={styles.stallDesc}>{stall.description}</p>
                <div className={styles.stallMeta}>
                  <span className={styles.stallMetaItem}>
                    <Star className={styles.metaStarIcon} />
                    {stall.rating} ({stall.reviewCount})
                  </span>
                  <span className={styles.stallMetaItem}>
                    <Clock className={styles.metaIcon} />
                    {stall.waitTime}
                  </span>
                  <span className={styles.stallMetaItem}>
                    <MapPin className={styles.metaIcon} />
                    {stall.location}
                  </span>
                  <span className="badge bg-gray-100 text-gray-600">
                    {stall.category}
                  </span>
                </div>
              </div>
              {stall.status === "pending" && (
                <div className={styles.pendingActions}>
                  <button
                    onClick={() => handleApprove(stall)}
                    className={styles.approveBtn}
                  >
                    <Check className={styles.actionIcon} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(stall)}
                    className={styles.rejectBtn}
                  >
                    <X className={styles.actionIcon} /> Reject
                  </button>
                </div>
              )}
              {stall.status === "approved" && (
                <button
                  onClick={() => handleReject(stall)}
                  className={styles.removeBtn}
                >
                  <X className={styles.actionIcon} /> Remove
                </button>
              )}
              {stall.status === "rejected" && (
                <button
                  onClick={() => handleApprove(stall)}
                  className={styles.reapproveBtn}
                >
                  <Check className={styles.actionIcon} /> Re-approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StallApproval;
