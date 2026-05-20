import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, CreditCard, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import api from "../../api/axios";
import styles from "./Checkout.module.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PICKUP_TIMES = ["ASAP", "+15 min", "+30 min", "+45 min", "+1 hour"];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

// Inner form — has access to Stripe hooks
const CheckoutForm = () => {
  const { items, stallId, stallName, eventId, eventName, getTotal, clearCart } =
    useCartStore();
  const { user } = useAuthStore();
  const { placeOrder, isLoading } = useOrderStore();
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const [note, setNote] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [paymentMethod, setPaymentMethod] = useState("pay_at_stall");
  const [isPaying, setIsPaying] = useState(false);

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ShoppingBag className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptySubtitle}>Add some food before checking out!</p>
        <Link to="/events" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    setIsPaying(true);
    try {
      // --- Stripe payment flow ---
      if (paymentMethod === "stripe") {
        if (!stripe || !elements) {
          toast.error("Stripe has not loaded yet. Please wait.");
          setIsPaying(false);
          return;
        }

        // 1. Ask backend to create a PaymentIntent
        const { data } = await api.post("/api/create-payment-intent/", {
          amount: getTotal(),
        });

        // 2. Confirm the card payment on the frontend
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
            },
          }
        );

        if (error) {
          toast.error(error.message || "Payment failed. Please try again.");
          setIsPaying(false);
          return;
        }

        if (paymentIntent.status !== "succeeded") {
          toast.error("Payment was not completed. Please try again.");
          setIsPaying(false);
          return;
        }
      }

      // 3. Place the order (works for both payment methods)
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
        paymentMethod,
      });

      clearCart();
      toast.success(
        paymentMethod === "stripe"
          ? "Payment successful! Order placed!"
          : "Order placed!"
      );
      navigate(`/orders/${order.id}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const busy = isLoading || isPaying;

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
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
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
            <span className={styles.summaryTotalValue}>{formatCurrency(getTotal())}</span>
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
                className={cn(styles.pickupBtn, pickupTime === t && styles.pickupBtnActive)}
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

        {/* Payment */}
        <div className={styles.paymentCard}>
          <h3 className={styles.paymentTitle}>
            <CreditCard className={styles.paymentIcon} /> Payment
          </h3>

          <div className={styles.paymentOptions}>
            {/* Pay at stall option */}
            <button
              onClick={() => setPaymentMethod("pay_at_stall")}
              className={cn(
                styles.paymentOption,
                paymentMethod === "pay_at_stall" && styles.paymentOptionActive
              )}
            >
              <span className={styles.paymentOptionRadio}>
                {paymentMethod === "pay_at_stall" && <span className={styles.paymentOptionDot} />}
              </span>
              <div>
                <p className={styles.paymentLabel}>Pay at stall</p>
                <p className={styles.paymentSub}>Cash or card accepted at the food stall</p>
              </div>
            </button>

            {/* Pay with Stripe option */}
            <button
              onClick={() => setPaymentMethod("stripe")}
              className={cn(
                styles.paymentOption,
                paymentMethod === "stripe" && styles.paymentOptionActive
              )}
            >
              <span className={styles.paymentOptionRadio}>
                {paymentMethod === "stripe" && <span className={styles.paymentOptionDot} />}
              </span>
              <div>
                <p className={styles.paymentLabel}>Pay with Card</p>
                <p className={styles.paymentSub}>Secure online payment via Stripe</p>
              </div>
              <span className={styles.stripeBadge}>Stripe</span>
            </button>
          </div>

          {/* Stripe card input — shown only when stripe is selected */}
          {paymentMethod === "stripe" && (
            <div className={styles.cardInputWrapper}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
              <p className={styles.testCardHint}>
                Test card: <strong>4242 4242 4242 4242</strong> · any future date · any CVC
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={busy}
          className={styles.placeOrderBtn}
        >
          {busy
            ? paymentMethod === "stripe"
              ? "Processing payment..."
              : "Placing order..."
            : `Place Order · ${formatCurrency(getTotal())}`}
        </button>
      </div>
    </div>
  );
};

// Outer wrapper provides the Stripe context
const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
