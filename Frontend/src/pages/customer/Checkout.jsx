import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, CreditCard, Clock } from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./Checkout.module.css";

const PICKUP_TIMES = ["ASAP", "+15 min", "+30 min", "+45 min", "+1 hour"];

const Checkout = () => {
  const { items, stallId, stallName, eventId, eventName, getTotal, clearCart } =
    useCartStore();
  const { user } = useAuthStore();
  const { placeOrder, isLoading } = useOrderStore();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ShoppingBag className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptySubtitle}>
          Add some food before checking out!
        </p>
        <Link to="/events" className="btn-primary">
          Browse Events
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    try {
      const order = await placeOrder({
        customerId: user.id,
        stallId,
        stallName,
        eventId,
        eventName,
        items,
        subtotal: getTotal(),
        total: getTotal(),
        note,
        pickupTime,
      });
      clearCart();
      toast.success("Order placed! 🎉");
      navigate(`/orders/${order.id}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <Link to={`/events/${eventId}`} className={styles.backLink}>
        <ArrowLeft className={styles.backIcon} /> Back
      </Link>

      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.stack}>
        {/* Order summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryStallName}>{stallName}</h2>
          <p className={styles.summaryEventName}>{eventName}</p>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.menuItemId} className={styles.item}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                )}
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemQty}>Qty: {item.quantity}</p>
                </div>
                <span className={styles.itemTotal}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span className={styles.summaryTotalValue}>
              {formatCurrency(getTotal())}
            </span>
          </div>
        </div>

        {/* Pickup time */}
        <div className={styles.pickupCard}>
          <h3 className={styles.pickupTitle}>
            <Clock className={styles.pickupIcon} /> Pickup Time
          </h3>
          <div className={styles.pickupOptions}>
            {PICKUP_TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setPickupTime(t)}
                className={cn(
                  styles.pickupBtn,
                  pickupTime === t && styles.pickupBtnActive,
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Special instructions */}
        <div className={styles.noteCard}>
          <h3 className={styles.noteTitle}>Special Instructions</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="Allergies, dietary requirements, special requests..."
          />
        </div>

        {/* Payment placeholder */}
        <div className={styles.paymentCard}>
          <h3 className={styles.paymentTitle}>
            <CreditCard className={styles.paymentIcon} /> Payment
          </h3>
          <div className={styles.paymentBox}>
            <CreditCard className={styles.paymentBoxIcon} />
            <div>
              <p className={styles.paymentLabel}>Pay at stall</p>
              <p className={styles.paymentSub}>
                Cash or card accepted at the food stall
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className={styles.placeOrderBtn}
        >
          {isLoading
            ? "Placing order..."
            : `Place Order · ${formatCurrency(getTotal())}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
