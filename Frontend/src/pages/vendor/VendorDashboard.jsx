import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ShoppingBag, TrendingUp, Star } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import { getStallsByVendor } from "../../services/stallService";
import {
  formatCurrency,
  getStatusColor,
  capitalize,
} from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./VendorDashboard.module.css";

const VendorDashboard = () => {
  const { user } = useAuthStore();
  const { orders, fetchStallOrders } = useOrderStore();
  const [stalls, setStalls] = useState([]);
  const [activeStall, setActiveStall] = useState(null);

  useEffect(() => {
    if (user) {
      getStallsByVendor(user.id).then((s) => {
        setStalls(s);
        if (s.length > 0) {
          setActiveStall(s[0]);
          fetchStallOrders(s[0].id);
        }
      });
    }
  }, [user, fetchStallOrders]);

  const handleStallChange = (stall) => {
    setActiveStall(stall);
    fetchStallOrders(stall.id);
  };

  const activeOrders = orders.filter((o) =>
    ["placed", "confirmed", "preparing"].includes(o.status),
  );
  const todayRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.total, 0);

  const stats = [
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Rating",
      value: activeStall?.rating || "-",
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.pageTitle}>Vendor Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, {user?.name.split(" ")[0]}
          </p>
        </div>
        <div className={styles.topActions}>
          <Link to="/vendor/menu" className="btn-outline text-sm">
            Manage Menu
          </Link>
          <Link to="/vendor/orders" className="btn-primary text-sm">
            View Orders
          </Link>
        </div>
      </div>

      {/* Stall selector */}
      {stalls.length > 1 && (
        <div className={styles.stallSelector}>
          {stalls.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStallChange(s)}
              className={cn(
                styles.stallTab,
                activeStall?.id === s.id && styles.stallTabActive,
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Active stall info */}
      {activeStall && (
        <div className={styles.activeStallCard}>
          <img
            src={activeStall.image}
            alt={activeStall.name}
            className={styles.activeStallImg}
          />
          <div className={styles.activeStallInfo}>
            <div className={styles.activeStallNameRow}>
              <h2 className={styles.activeStallName}>{activeStall.name}</h2>
              <span className={`badge ${getStatusColor(activeStall.status)}`}>
                {capitalize(activeStall.status)}
              </span>
              <span
                className={`badge ${activeStall.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {activeStall.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className={styles.activeStallMeta}>
              {activeStall.category} · {activeStall.location}
            </p>
          </div>
          <Link to="/vendor/profile" className="btn-secondary text-sm">
            Edit Stall
          </Link>
        </div>
      )}

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

      {/* Recent orders */}
      <div className={styles.recentCard}>
        <div className={styles.recentHeader}>
          <h3 className={styles.recentTitle}>Recent Orders</h3>
          <Link to="/vendor/orders" className={styles.recentViewAll}>
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className={styles.recentEmpty}>
            <ShoppingBag className={styles.recentEmptyIcon} />
            <p className={styles.recentEmptyText}>No orders yet</p>
          </div>
        ) : (
          <div className={styles.recentList}>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className={styles.recentOrder}>
                <div className={styles.recentOrderLeft}>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {capitalize(order.status)}
                  </span>
                  <div>
                    <span className={styles.recentCode}>
                      #{order.pickupCode}
                    </span>
                    <p className={styles.recentItems}>
                      {order.items.length} item(s)
                    </p>
                  </div>
                </div>
                <span className={styles.recentTotal}>
                  {formatCurrency(order.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
