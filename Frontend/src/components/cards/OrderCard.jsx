import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import {
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  capitalize,
} from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./OrderCard.module.css";

const OrderCard = ({ order }) => (
  <Link to={`/orders/${order.id}`} className={styles.link}>
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.statusRow}>
          <span className={cn(styles.orderBadge, getStatusColor(order.status))}>
            {capitalize(order.status)}
          </span>
          <span className={styles.timestamp}>
            <Clock className={styles.timestampIcon} />
            {formatRelativeTime(order.placedAt)}
          </span>
        </div>
        <h4 className={styles.stallName}>{order.stallName}</h4>
        <p className={styles.eventName}>{order.eventName}</p>
        <div className={styles.itemList}>
          {order.items.map((item, i) => (
            <span key={item.menuItemId}>
              {item.quantity}× {item.name}
              {i < order.items.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.total}>{formatCurrency(order.total)}</span>
        <ChevronRight className={styles.chevron} />
      </div>
    </div>

    {order.status !== "completed" && order.status !== "cancelled" && (
      <div className={styles.activeFooter}>
        <div className={styles.activeDot} />
        <span className={styles.activeLabel}>
          {order.status === "ready"
            ? "🎉 Ready for pickup!"
            : `Pickup code: ${order.pickupCode}`}
        </span>
      </div>
    )}
  </Link>
);

export default OrderCard;
