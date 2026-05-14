import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./CartDrawer.module.css";

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    items,
    stallName,
    eventName,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
  } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <div
        className={cn(
          styles.drawer,
          isOpen ? styles.drawerOpen : styles.drawerClosed,
        )}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>Your Order</h2>
            {stallName && (
              <p className={styles.headerSubtitle}>
                {stallName} · {eventName}
              </p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptySubtitle}>
                Browse events and add some food!
              </p>
            </div>
          ) : (
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
                    <p className={styles.itemPrice}>
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className={styles.itemControls}>
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity - 1)
                      }
                      className={styles.decrementBtn}
                    >
                      <Minus className={styles.controlIcon} />
                    </button>
                    <span className={styles.quantityLabel}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity + 1)
                      }
                      className={styles.incrementBtn}
                    >
                      <Plus className={styles.controlIcon} />
                    </button>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className={styles.removeBtn}
                    >
                      <Trash2 className={styles.removeIcon} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span className={styles.subtotalValue}>
                {formatCurrency(getTotal())}
              </span>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalValue}>
                {formatCurrency(getTotal())}
              </span>
            </div>
            <button onClick={handleCheckout} className={styles.checkoutBtn}>
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className={styles.clearBtn}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
