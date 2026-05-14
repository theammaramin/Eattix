import { Plus, Clock } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./MenuItemCard.module.css";

const MenuItemCard = ({ item, onAdd, disabled }) => (
  <div
    className={cn(styles.itemCard, !item.isAvailable && styles.cardUnavailable)}
  >
    {item.image && (
      <div className={styles.thumbnail}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.thumbnailImage}
        />
      </div>
    )}

    <div className={styles.content}>
      <div>
        <div className={styles.header}>
          <h4 className={styles.name}>{item.name}</h4>
          {item.tags?.includes("Popular") && (
            <span className={styles.popularBadge}>Popular</span>
          )}
          {item.tags?.includes("Best Seller") && (
            <span className={styles.bestSellerBadge}>Best Seller</span>
          )}
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.tagRow}>
          {item.tags
            ?.filter((t) => t !== "Popular" && t !== "Best Seller")
            .slice(0, 3)
            .map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatCurrency(item.price)}</span>
          {item.prepTime && (
            <div className={styles.prepTime}>
              <Clock className={styles.prepTimeIcon} />
              <span>{item.prepTime} min</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onAdd(item)}
          disabled={!item.isAvailable || disabled}
          className={cn(styles.addButton, styles.addButtonDisabled)}
        >
          <Plus className={styles.addIcon} />
          {item.isAvailable ? "Add" : "Unavailable"}
        </button>
      </div>
    </div>
  </div>
);

export default MenuItemCard;
