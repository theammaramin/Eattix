import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import OrderCard from "../../components/cards/OrderCard";
import { cn } from "../../utils/cn";
import styles from "./OrderHistory.module.css";

const FILTER_TABS = ["all", "active", "completed", "cancelled"];

const OrderHistory = () => {
  const { user } = useAuthStore();
  const { orders, fetchCustomerOrders, isLoading } = useOrderStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) fetchCustomerOrders(user.id);
  }, [user, fetchCustomerOrders]);

  const ACTIVE_STATUSES = ["placed", "confirmed", "preparing", "ready"];

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return ACTIVE_STATUSES.includes(o.status);
    return o.status === filter;
  });

  if (!user)
    return (
      <div className={styles.notSignedIn}>
        <ShoppingBag className={styles.notSignedInIcon} />
        <h2 className={styles.notSignedInTitle}>Sign in to view orders</h2>
        <Link to="/login" className="btn-primary mt-2">
          Log In
        </Link>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>My Orders</h1>
        <Link to="/events" className={styles.browseLink}>
          Browse events <ArrowRight className={styles.browseLinkIcon} />
        </Link>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              styles.filterTab,
              filter === tab && styles.filterTabActive,
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.skeletonList}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptySubtitle}>
            Time to find some delicious food!
          </p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
