import { useState, useEffect, useRef } from "react";
import { Check, X, ChefHat, Bell, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import { getStallsByVendor } from "../../services/stallService";
import {
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  capitalize,
} from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./IncomingOrders.module.css";

const VENDOR_ACTIONS = {
  placed: {
    next: "confirmed",
    label: "Accept",
    icon: Check,
    color: "bg-green-500 hover:bg-green-600 text-white",
  },
  confirmed: {
    next: "preparing",
    label: "Start Preparing",
    icon: ChefHat,
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  preparing: {
    next: "ready",
    label: "Mark Ready",
    icon: Bell,
    color: "bg-brand-500 hover:bg-brand-600 text-white",
  },
};

const STATUS_TABS = [
  "all",
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

const IncomingOrders = () => {
  const { user } = useAuthStore();
  const { orders, fetchStallOrders, updateOrderStatus, isLoading } =
    useOrderStore();
  const [filter, setFilter] = useState("all");
  const [stallId, setStallId] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (user) {
      getStallsByVendor(user.id).then((stalls) => {
        if (stalls.length > 0) {
          setStallId(stalls[0].id);
          fetchStallOrders(stalls[0].id);
          intervalRef.current = setInterval(
            () => fetchStallOrders(stalls[0].id),
            8000,
          );
        }
      });
    }
    return () => clearInterval(intervalRef.current);
  }, [user, fetchStallOrders]);

  const handleAction = async (order, nextStatus) => {
    try {
      await updateOrderStatus(order.id, nextStatus);
      toast.success(`Order #${order.pickupCode} → ${capitalize(nextStatus)}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleCancel = async (order) => {
    try {
      await updateOrderStatus(order.id, "cancelled");
      toast.success(`Order #${order.pickupCode} cancelled`);
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter,
  );

  const getOrderCardStyle = (status) => {
    if (status === "placed")
      return cn(styles.orderCard, styles.orderCardPlaced);
    if (status === "preparing")
      return cn(styles.orderCard, styles.orderCardPreparing);
    if (status === "ready") return cn(styles.orderCard, styles.orderCardReady);
    return cn(styles.orderCard, styles.orderCardDefault);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>Incoming Orders</h1>
        <button
          onClick={() => stallId && fetchStallOrders(stallId)}
          className={styles.refreshBtn}
        >
          <RefreshCw
            className={isLoading ? styles.refreshIconSpin : styles.refreshIcon}
          />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className={styles.filterRow}>
        {STATUS_TABS.map((tab) => {
          const count =
            tab === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab).length;
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
                    filter === tab && styles.tabCountActive,
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Bell className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            No orders {filter !== "all" ? `with status "${filter}"` : ""}
          </p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {filtered.map((order) => {
            const action = VENDOR_ACTIONS[order.status];
            return (
              <div key={order.id} className={getOrderCardStyle(order.status)}>
                <div className={styles.orderHeader}>
                  <div>
                    <div className={styles.orderBadgeRow}>
                      <span
                        className={`badge ${getStatusColor(order.status)} font-semibold`}
                      >
                        {capitalize(order.status)}
                      </span>
                      <span className={styles.orderCode}>
                        #{order.pickupCode}
                      </span>
                    </div>
                    <p className={styles.orderTime}>
                      {formatRelativeTime(order.placedAt)}
                    </p>
                  </div>
                  <span className={styles.orderTotal}>
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className={styles.orderItems}>
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className={styles.orderItem}>
                      <span className={styles.orderItemName}>
                        {item.quantity}× {item.name}
                      </span>
                      <span className={styles.orderItemPrice}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div className={styles.orderNote}>📝 {order.note}</div>
                )}

                <div className={styles.orderActions}>
                  {action && (
                    <button
                      onClick={() => handleAction(order, action.next)}
                      className={cn(styles.actionBtn, action.color)}
                    >
                      <action.icon className={styles.actionIcon} />
                      {action.label}
                    </button>
                  )}
                  {["placed", "confirmed"].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order)}
                      className={styles.cancelBtn}
                    >
                      <X className={styles.actionIcon} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncomingOrders;
