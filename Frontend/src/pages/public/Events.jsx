import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getEvents } from "../../services/eventService";
import EventCard from "../../components/cards/EventCard";
import { cn } from "../../utils/cn";
import styles from "./Events.module.css";

const CATEGORIES = [
  "All",
  "Food Festival",
  "Night Market",
  "Cultural Festival",
];
const STATUSES = ["All", "upcoming", "past"];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (search) filters.search = search;
    if (category !== "All") filters.category = category;
    if (status !== "All") filters.status = status;
    getEvents(filters).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [search, category, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.elements.search.value;
    setSearch(val);
    setSearchParams(val ? { search: val } : {});
  };

  const clearSearch = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Browse Events</h1>
        <p className={styles.pageSubtitle}>
          Find food stalls at events near you
        </p>
      </div>

      {/* Search + Filters */}
      <div className={styles.searchRow}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search events..."
              className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.clearBtn}
              >
                <X className={styles.clearIcon} />
              </button>
            )}
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <SlidersHorizontal className={styles.filterIcon} />
          {CATEGORIES.map((c) => (
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
        <div className={styles.filterGroup}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                styles.statusPill,
                status === s && styles.statusPillActive,
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.eventsGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyEmoji}>🍽️</p>
          <h3 className={styles.emptyTitle}>No events found</h3>
          <p className={styles.emptySubtitle}>
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
              setStatus("All");
            }}
            className={styles.clearFiltersBtn}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <p className={styles.resultCount}>
            {events.length} event{events.length !== 1 ? "s" : ""} found
          </p>
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
