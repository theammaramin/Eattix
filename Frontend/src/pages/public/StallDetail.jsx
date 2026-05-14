import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, MapPin, ChevronLeft, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { getStallById, getMenuByStall } from "../../services/stallService";
import { getEventById } from "../../services/eventService";
import MenuItemCard from "../../components/cards/MenuItemCard";
import useCartStore from "../../store/cartStore";
import { cn } from "../../utils/cn";
import styles from "./StallDetail.module.css";

const StallDetail = () => {
  const { eventId, stallId } = useParams();
  const [stall, setStall] = useState(null);
  const [event, setEvent] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartStallId = useCartStore((s) => s.stallId);

  useEffect(() => {
    Promise.all([
      getStallById(stallId),
      getMenuByStall(stallId),
      getEventById(eventId),
    ]).then(([s, m, e]) => {
      setStall(s);
      setMenu(m);
      setEvent(e);
      setLoading(false);
    });
  }, [stallId, eventId]);

  const categories = ["All", ...new Set(menu.map((m) => m.category))];

  const filteredMenu =
    activeCategory === "All"
      ? menu
      : menu.filter((m) => m.category === activeCategory);

  const handleAdd = (item) => {
    if (!stall || !event) return;
    const result = addItem(item, stall, event);
    if (result.conflict) {
      setPendingItem(item);
      setShowConflictModal(true);
      return;
    }
    toast.success(`${item.name} added to cart!`, { icon: "🛒" });
  };

  const handleConflictReplace = () => {
    clearCart();
    if (pendingItem && stall && event) {
      addItem(pendingItem, stall, event);
      toast.success(`${pendingItem.name} added to cart!`, { icon: "🛒" });
    }
    setShowConflictModal(false);
    setPendingItem(null);
  };

  if (loading)
    return (
      <div className={styles.skeleton}>
        <div className="h-48 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );

  if (!stall)
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundEmoji}>😕</p>
        <h3 className={styles.notFoundTitle}>Stall not found</h3>
        <Link
          to={`/events/${eventId}`}
          className="btn-primary mt-4 inline-block"
        >
          Back to Event
        </Link>
      </div>
    );

  return (
    <div>
      {/* Banner */}
      <div className={styles.banner}>
        <img src={stall.banner} alt={stall.name} className={styles.bannerImg} />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInner}>
            <Link to={`/events/${eventId}`} className={styles.backLink}>
              <ChevronLeft className={styles.backIcon} /> {event?.title}
            </Link>
            <div className={styles.bannerBadges}>
              <span className={styles.categoryBadge}>{stall.category}</span>
              <span
                className={cn(
                  styles.openBadge,
                  stall.isOpen ? styles.openBadgeOpen : styles.openBadgeClosed,
                )}
              >
                {stall.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <h1 className={styles.bannerTitle}>{stall.name}</h1>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* Stall info bar */}
        <div className={styles.infoBar}>
          <div className={styles.infoStats}>
            <div className={styles.infoStat}>
              <Star className={styles.starIcon} />
              <span className={styles.ratingValue}>{stall.rating}</span>
              <span className={styles.reviewCount}>
                ({stall.reviewCount} reviews)
              </span>
            </div>
            <div className={styles.infoStat}>
              <Clock className={styles.infoIcon} />
              <span>Wait: {stall.waitTime}</span>
            </div>
            <div className={styles.infoStat}>
              <MapPin className={styles.infoIcon} />
              <span>{stall.location}</span>
            </div>
          </div>
          <div className={styles.tagRow}>
            {stall.tags?.map((tag) => (
              <span key={tag} className="badge bg-gray-100 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className={styles.categoryTabs}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                styles.categoryTab,
                activeCategory === c && styles.categoryTabActive,
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Menu */}
        {filteredMenu.length === 0 ? (
          <div className={styles.emptyMenu}>
            <p className={styles.emptyEmoji}>🍽️</p>
            <p className={styles.emptyText}>No items in this category</p>
          </div>
        ) : (
          <div className={styles.menuList}>
            {filteredMenu.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={handleAdd}
                disabled={!stall.isOpen}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart conflict modal */}
      {showConflictModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconWrap}>
                <ShoppingCart className={styles.modalIcon} />
              </div>
              <div>
                <h3 className={styles.modalTitle}>Replace cart?</h3>
                <p className={styles.modalSubtitle}>
                  You have items from another stall
                </p>
              </div>
            </div>
            <p className={styles.modalBody}>
              Your cart has items from <strong>{cartStallId}</strong>. Starting
              a new order will clear your current cart.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowConflictModal(false);
                  setPendingItem(null);
                }}
                className="btn-secondary flex-1"
              >
                Keep current
              </button>
              <button
                onClick={handleConflictReplace}
                className="btn-primary flex-1"
              >
                Replace cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StallDetail;
