import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  UtensilsCrossed,
  ArrowRight,
  Star,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  ClipboardList,
  Zap,
} from "lucide-react";
import { getEvents } from "../../services/eventService";
import { mockStalls } from "../../mock/stalls";
import { mockEvents } from "../../mock/events";
import EventCard, { EventCardScroll } from "../../components/cards/EventCard";
import { StallCardFeatured } from "../../components/cards/StallCard";
import { cn } from "../../utils/cn";
import styles from "./Home.module.css";

const FOOD_CATEGORIES = [
  { label: "🌮 Mexican", value: "Mexican" },
  { label: "🔥 BBQ", value: "BBQ" },
  { label: "🍣 Japanese", value: "Japanese" },
  { label: "🍛 Indian", value: "Indian" },
  { label: "🥙 Mediterranean", value: "Mediterranean" },
  { label: "🍔 Burgers", value: "Burgers" },
  { label: "🍨 Desserts", value: "Desserts" },
  { label: "🍖 Korean", value: "Korean" },
  { label: "🍝 Italian", value: "Italian" },
  { label: "🌍 African", value: "African" },
  { label: "🍜 Vietnamese", value: "Vietnamese" },
  { label: "🎪 All Events", value: "" },
];

const CATEGORY_GRID = [
  {
    label: "Mexican",
    emoji: "🌮",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60",
    color: "from-red-600/70",
  },
  {
    label: "BBQ",
    emoji: "🔥",
    image:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60",
    color: "from-orange-700/70",
  },
  {
    label: "Japanese",
    emoji: "🍣",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop&q=60",
    color: "from-pink-700/70",
  },
  {
    label: "Indian",
    emoji: "🍛",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60",
    color: "from-yellow-700/70",
  },
  {
    label: "Burgers",
    emoji: "🍔",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60",
    color: "from-amber-700/70",
  },
  {
    label: "Desserts",
    emoji: "🍨",
    image:
      "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=60",
    color: "from-purple-700/70",
  },
  {
    label: "Korean",
    emoji: "🍖",
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=60",
    color: "from-rose-700/70",
  },
  {
    label: "Mediterranean",
    emoji: "🥙",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60",
    color: "from-green-700/70",
  },
];

const HOW_IT_WORKS = [
  {
    icon: MapPin,
    step: "01",
    title: "Find an Event",
    desc: "Discover food festivals, markets, and events happening near you today or this weekend.",
  },
  {
    icon: UtensilsCrossed,
    step: "02",
    title: "Browse Stalls & Menus",
    desc: "Explore all the food stalls at an event, check menus, prices, wait times, and ratings.",
  },
  {
    icon: Smartphone,
    step: "03",
    title: "Order & Track in Real-Time",
    desc: "Place your order from your phone, get a pickup code, and track status live.",
  },
];

const ScrollRow = ({ children, id }) => {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current)
      ref.current.scrollBy({ left: dir * 290, behavior: "smooth" });
  };
  return (
    <div className={`group/row ${styles.scrollRowWrapper}`}>
      <button
        onClick={() => scroll(-1)}
        className={styles.scrollBtnLeft}
        aria-label="Scroll left"
      >
        <ChevronLeft className={styles.scrollBtnIcon} />
      </button>
      <div
        ref={ref}
        id={id}
        className={styles.scrollRowList}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className={styles.scrollBtnRight}
        aria-label="Scroll right"
      >
        <ChevronRight className={styles.scrollBtnIcon} />
      </button>
    </div>
  );
};

const SectionHeader = ({ title, to }) => (
  <div className={styles.sectionHeader}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <Link to={to} className={styles.sectionLink}>
      SEE ALL <ChevronRight className={styles.sectionLinkIcon} />
    </Link>
  </div>
);

const SkeletonScrollRow = () => (
  <div className={styles.skeletonRow}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className={styles.skeletonCardImg} />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeDateFilter, setActiveDateFilter] = useState("today");
  const navigate = useNavigate();

  useEffect(() => {
    getEvents({ status: "upcoming" }).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchInput)}`);
  };

  const todayEvents = events;
  const trendingEvents = [...events].sort(
    (a, b) => b.stallCount - a.stallCount,
  );

  const featuredStalls = mockStalls
    .filter((s) => s.status === "approved" && s.isOpen)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map((s) => ({
      ...s,
      eventTitle: mockEvents.find((e) => e.id === s.eventId)?.title || "",
    }));

  const stats = [
    { icon: UtensilsCrossed, label: "Food Stalls", value: "500+" },
    { icon: Calendar, label: "Events Monthly", value: "50+" },
    { icon: Star, label: "Happy Customers", value: "20K+" },
    { icon: MapPin, label: "Cities", value: "12" },
  ];

  return (
    <div>
      {/* ── 1. HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBg}
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&auto=format&fit=crop&q=40')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <span className={styles.heroBadge}>
              🍔 Australia&apos;s Food Stall Marketplace
            </span>
            <h1 className={styles.heroTitle}>
              Discover & Order
              <br />
              <span className={styles.heroTitleHighlight}>Amazing Food</span>
              <br />
              at Events Near You
            </h1>
            <p className={styles.heroSubtitle}>
              Browse hundreds of food stalls at live events. View menus, place
              orders, and track your food in real-time.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className={styles.heroSearchForm}>
              <div className={styles.heroSearchBox}>
                <Search className={styles.heroSearchIcon} />
                <input
                  type="text"
                  placeholder="Search events, cuisine, location..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent"
                />
              </div>
              <button type="submit" className={styles.heroSearchBtn}>
                Search
              </button>
            </form>

            {/* Date quick-filter pills */}
            <div className={styles.dateFilterRow}>
              {[
                { key: "today", label: "📅 Today" },
                { key: "weekend", label: "🎉 This Weekend" },
                { key: "week", label: "📆 This Week" },
                { key: "all", label: "🗓️ All Upcoming" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveDateFilter(key);
                    navigate("/events");
                  }}
                  className={cn(
                    styles.datePill,
                    activeDateFilter === key && styles.datePillActive,
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY FILTER PILLS ── */}
      <section className={styles.categoryBar}>
        <div className={styles.categoryBarInner}>
          <div
            className={styles.categoryPillsRow}
            style={{ scrollbarWidth: "none" }}
          >
            {FOOD_CATEGORIES.map(({ label, value }) => (
              <button
                key={label}
                onClick={() =>
                  navigate(`/events${value ? `?search=${value}` : ""}`)
                }
                className={styles.categoryPill}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          <div className={styles.statsGrid}>
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className={styles.statItem}>
                <div className={styles.statIconWrap}>
                  <Icon className={styles.statIcon} />
                </div>
                <div>
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FOOD EVENTS ON TODAY ── */}
      <section className={styles.scrollSection}>
        <SectionHeader title="🍽️ Food Events On Today" to="/events" />
        {loading ? (
          <SkeletonScrollRow />
        ) : (
          <ScrollRow id="today-row">
            {todayEvents.map((event) => (
              <EventCardScroll key={event.id} event={event} />
            ))}
            {todayEvents.length === 0 && (
              <p className={styles.noEventsText}>
                No events today — check back soon!
              </p>
            )}
          </ScrollRow>
        )}
      </section>

      {/* ── 5. TRENDING THIS WEEK ── */}
      <section className={styles.scrollSectionStd}>
        <SectionHeader title="🔥 Trending Events This Week" to="/events" />
        {loading ? (
          <SkeletonScrollRow />
        ) : (
          <ScrollRow id="trending-row">
            {trendingEvents.map((event) => (
              <EventCardScroll key={event.id} event={event} />
            ))}
          </ScrollRow>
        )}
      </section>

      {/* ── 6. BROWSE BY FOOD CATEGORY ── */}
      <section className={styles.categoryGridSection}>
        <div className={styles.categoryGridInner}>
          <div className={styles.categoryGridHeader}>
            <div>
              <h2 className={styles.categoryGridTitle}>Browse by Food Type</h2>
              <p className={styles.categoryGridSubtitle}>
                Find stalls serving your favourite cuisine
              </p>
            </div>
            <Link to="/events" className={styles.categoryGridAllLink}>
              ALL CUISINES <ChevronRight className={styles.sectionLinkIcon} />
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORY_GRID.map(({ label, emoji, image, color }) => (
              <Link
                key={label}
                to={`/events?search=${label}`}
                className={`group ${styles.categoryGridItem}`}
              >
                <img
                  src={image}
                  alt={label}
                  className={styles.categoryGridItemImg}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`}
                />
                <div className={styles.categoryGridItemContent}>
                  <span className={styles.categoryGridItemEmoji}>{emoji}</span>
                  <span className={styles.categoryGridItemLabel}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. POPULAR FOOD STALLS ── */}
      <section className={styles.scrollSectionStalls}>
        <SectionHeader title="⭐ Popular Food Stalls" to="/events" />
        <ScrollRow id="stalls-row">
          {featuredStalls.map((stall) => (
            <StallCardFeatured
              key={stall.id}
              stall={stall}
              eventId={stall.eventId}
              eventTitle={stall.eventTitle}
            />
          ))}
        </ScrollRow>
      </section>

      {/* ── 8. HOW IT WORKS ── */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.howHeader}>
            <h2 className={styles.howTitle}>How Eattix Works</h2>
            <p className={styles.howSubtitle}>
              From discovery to pickup in 3 simple steps
            </p>
          </div>
          <div className={styles.howGrid}>
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={step} className={styles.howStep}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className={styles.howConnector} />
                )}
                <div className={styles.howIconWrap}>
                  <Icon className={styles.howStepIcon} />
                </div>
                <span className={styles.howStepNum}>Step {step}</span>
                <h3 className={styles.howStepTitle}>{title}</h3>
                <p className={styles.howStepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. ALL UPCOMING EVENTS GRID ── */}
      <section className={styles.allEventsSection}>
        <div className={styles.allEventsHeader}>
          <div>
            <h2 className={styles.allEventsTitle}>More Events</h2>
            <p className={styles.allEventsSubtitle}>All upcoming food events</p>
          </div>
          <Link to="/events" className={styles.allEventsLink}>
            View all <ArrowRight className={styles.allEventsLinkIcon} />
          </Link>
        </div>
        {loading ? (
          <div className={styles.eventsGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeletonEventCard}>
                <div className={styles.skeletonEventImg} />
                <div className={styles.skeletonEventBody}>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ── 10. DUAL CTA BANNER ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGrid}>
            {/* Vendor CTA */}
            <div className={styles.ctaVendor}>
              <div
                className={`${styles.ctaCircleLg} ${styles.ctaCircleLight}`}
              />
              <div
                className={`${styles.ctaCircleSm} ${styles.ctaCircleLight}`}
              />
              <div className={styles.ctaContent}>
                <span className={styles.ctaEmoji}>🍳</span>
                <h3 className={styles.ctaTitle}>Own a food stall?</h3>
                <p className={styles.ctaVendorBody}>
                  Join thousands of vendors on Eattix. Reach more customers,
                  manage your menu online, and track orders in real-time.
                </p>
                <Link
                  to="/register?role=vendor"
                  className={styles.ctaVendorBtn}
                >
                  <Zap className={styles.ctaBtnIcon} /> List Your Stall
                </Link>
              </div>
            </div>
            {/* Organizer CTA */}
            <div className={styles.ctaOrganizer}>
              <div
                className={`${styles.ctaCircleLg} ${styles.ctaCircleDark}`}
              />
              <div
                className={`${styles.ctaCircleSm} ${styles.ctaCircleDark}`}
              />
              <div className={styles.ctaContent}>
                <span className={styles.ctaEmoji}>🎪</span>
                <h3 className={styles.ctaTitle}>Hosting a food event?</h3>
                <p className={styles.ctaOrgBody}>
                  Create your event on Eattix, invite food stalls, and give your
                  attendees a seamless ordering experience.
                </p>
                <Link
                  to="/register?role=organizer"
                  className={styles.ctaOrgBtn}
                >
                  <ClipboardList className={styles.ctaBtnIcon} /> Create an
                  Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
