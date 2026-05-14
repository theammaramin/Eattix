import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  ChefHat,
  Bell,
  Hash,
} from "lucide-react";
import useOrderStore from "../../store/orderStore";
import useOrderPolling from "../../hooks/useOrderPolling";
import { formatCurrency, formatRelativeTime } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./OrderTracking.module.css";

const STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    icon: CheckCircle,
    description: "Your order has been received",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    description: "The stall has confirmed your order",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: ChefHat,
    description: "Your food is being prepared",
  },
  {
    key: "ready",
    label: "Ready for Pickup",
    icon: Bell,
    description: "Your food is ready! Head to the stall.",
  },
];

const STATUS_ORDER = ["placed", "confirmed", "preparing", "ready", "completed"];

const OrderTracking = () => {
  const { orderId } = useParams();
  const { fetchOrderById } = useOrderStore();
  const order = useOrderPolling(orderId);

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId, fetchOrderById]);

  if (!order)
    return (
      <div className={styles.skeleton}>
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    );

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  const statusClass =
    {
      placed: styles.statusBannerPlaced,
      confirmed: styles.statusBannerPlaced,
      preparing: styles.statusBannerPlaced,
      ready: styles.statusBannerReady,
      completed: styles.statusBannerDone,
      cancelled: styles.statusBannerCancelled,
    }[order.status] || styles.statusBannerPlaced;

  return (
    <div className={styles.page}>
      <Link to="/orders" className={styles.backLink}>
        <ArrowLeft className={styles.backIcon} /> My Orders
      </Link>

      {/* Status banner */}
      <div className={cn(styles.statusBanner, statusClass)}>
        <div className={styles.statusTop}>
          <div>
            <p className={styles.statusStallName}>{order.stallName}</p>
            <h2 className={styles.statusHeading}>
              {isCancelled
                ? "Order Cancelled"
                : isCompleted
                  ? "Order Completed ✓"
                  : order.status === "ready"
                    ? "🎉 Ready for Pickup!"
                    : "Order in Progress"}
            </h2>
          </div>
          {!isCompleted && !isCancelled && (
            <div className={styles.statusSpinner}>
              <Clock className={styles.spinnerIcon} />
            </div>
          )}
        </div>
        <div className={styles.pickupCodeBox}>
          <Hash className={styles.pickupCodeIcon} />
          <div>
            <p className={styles.pickupCodeLabel}>Pickup Code</p>
            <p className={styles.pickupCode}>{order.pickupCode}</p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      {!isCancelled && (
        <div className={styles.progressCard}>
          <h3 className={styles.progressTitle}>Order Progress</h3>
          <div className={styles.progressSteps}>
            {STEPS.map((step) => {
              const stepIdx = STATUS_ORDER.indexOf(step.key);
              const done = currentIdx > stepIdx || isCompleted;
              const active = currentIdx === stepIdx && !isCompleted;
              return (
                <div key={step.key} className={styles.step}>
                  <div
                    className={cn(
                      styles.stepDot,
                      done
                        ? styles.stepDotDone
                        : active
                          ? styles.stepDotActive
                          : styles.stepDotIdle,
                    )}
                  >
                    <step.icon
                      className={cn(
                        styles.stepIcon,
                        done || active
                          ? styles.stepIconActive
                          : styles.stepIconIdle,
                      )}
                    />
                  </div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                      <p
                        className={cn(
                          styles.stepLabel,
                          done || active
                            ? styles.stepLabelActive
                            : styles.stepLabelIdle,
                        )}
                      >
                        {step.label}
                      </p>
                      {active && (
                        <span className={styles.stepBadgeCurrent}>Current</span>
                      )}
                      {done && (
                        <span className={styles.stepBadgeDone}>Done ✓</span>
                      )}
                    </div>
                    <p
                      className={cn(
                        styles.stepDesc,
                        done || active
                          ? styles.stepDescActive
                          : styles.stepDescIdle,
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className={styles.detailsCard}>
        <h3 className={styles.detailsTitle}>Order Details</h3>
        <div className={styles.detailsItems}>
          {order.items.map((item) => (
            <div key={item.menuItemId} className={styles.detailItem}>
              <span className={styles.detailItemName}>
                {item.quantity}× {item.name}
              </span>
              <span className={styles.detailItemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.detailsTotal}>
          <span>Total</span>
          <span className={styles.detailsTotalValue}>
            {formatCurrency(order.total)}
          </span>
        </div>
        {order.note && (
          <div className={styles.detailNote}>
            <span className={styles.detailNoteBold}>Note: </span>
            {order.note}
          </div>
        )}
        <p className={styles.detailPlacedAt}>
          Placed {formatRelativeTime(order.placedAt)}
        </p>
      </div>

      {isCompleted && (
        <div className={styles.completedActions}>
          <Link to="/events" className="btn-primary px-8">
            Order Again
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
