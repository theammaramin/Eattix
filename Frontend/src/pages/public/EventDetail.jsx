import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  ChevronLeft,
  Search,
} from "lucide-react";
import { getEventById } from "../../services/eventService";
import { getStallsByEvent } from "../../services/stallService";
import StallCard from "../../components/cards/StallCard";
import { formatDate, getStatusColor, capitalize } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./EventDetail.module.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    Promise.all([getEventById(eventId), getStallsByEvent(eventId)]).then(
      ([ev, st]) => {
        setEvent(ev);
        setStalls(st);
        setLoading(false);
      },
    );
  }, [eventId]);

  const categories = ["All", ...new Set(stalls.map((s) => s.category))];
  const approvedStalls = stalls.filter((s) => s.status === "approved");

  const filtered = approvedStalls.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  if (loading)
    return (
      <div className={styles.skeleton}>
        <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );

  if (!event)
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundEmoji}>😕</p>
        <h3 className={styles.notFoundTitle}>Event not found</h3>
        <Link to="/events" className="btn-primary mt-4 inline-block">
          Browse Events
        </Link>
      </div>
    );

  return (
    <div>
      {/* Banner */}
      <div className={styles.banner}>
        <img
          src={event.banner}
          alt={event.title}
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInner}>
            <Link to="/events" className={styles.backLink}>
              <ChevronLeft className={styles.backIcon} /> Back to Events
            </Link>
            <div className={styles.badgeRow}>
              <span className="badge bg-white/90 text-gray-700 shadow-sm">
                {event.category}
              </span>
              <span
                className={cn("badge shadow-sm", getStatusColor(event.status))}
              >
                {capitalize(event.status)}
              </span>
            </div>
            <h1 className={styles.bannerTitle}>{event.title}</h1>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.contentGrid}>
          {/* Left — stalls */}
          <div className={styles.mainCol}>
            <div className={styles.stallSearchWrapper}>
              <div className={styles.stallSearchInput}>
                <Search className={styles.stallSearchIcon} />
                <input
                  placeholder="Search stalls..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                />
              </div>
            </div>
            <div className={styles.stallFilterRow}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    styles.filterPill,
                    category === c && styles.filterPillActive,
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <h2 className={styles.stallsTitle}>
              Food Stalls{" "}
              <span className={styles.stallCount}>({filtered.length})</span>
            </h2>

            {filtered.length === 0 ? (
              <div className={styles.stallEmpty}>
                <p className={styles.stallEmptyEmoji}>🍴</p>
                <p className={styles.stallEmptyText}>
                  No stalls found for your search
                </p>
              </div>
            ) : (
              <div className={styles.stallGrid}>
                {filtered.map((stall) => (
                  <StallCard key={stall.id} stall={stall} eventId={eventId} />
                ))}
              </div>
            )}
          </div>

          {/* Right — event info */}
          <div className={styles.sidebarStack}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>Event Details</h3>
              <div className={styles.infoRows}>
                <div className={styles.infoRow}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <p className={styles.infoTextBold}>
                      {formatDate(event.date)}
                    </p>
                    {event.endDate !== event.date && (
                      <p className={styles.infoSubText}>
                        to {formatDate(event.endDate)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Clock className={styles.infoIcon} />
                  <p className={styles.infoTextBold}>{event.time}</p>
                </div>
                <div className={styles.infoRow}>
                  <MapPin className={styles.infoIcon} />
                  <p className={styles.infoTextBold}>{event.location}</p>
                </div>
              </div>
            </div>

            <div className={styles.aboutCard}>
              <h3 className={styles.aboutTitle}>About</h3>
              <p className={styles.aboutText}>{event.description}</p>
            </div>

            {event.tags?.length > 0 && (
              <div className={styles.tagsCard}>
                <h3 className={styles.tagsTitle}>Tags</h3>
                <div className={styles.tagsRow}>
                  {event.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      <Tag className={styles.tagIcon} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
