import { Link } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";
import { cn } from "../../utils/cn";
import styles from "./StallCard.module.css";

const StallCard = ({ stall, eventId }) => (
  <Link
    to={`/events/${eventId}/stalls/${stall.id}`}
    className={cn(styles.stallCard, "group")}
  >
    <div className={styles.imageWrapper}>
      <img
        src={stall.image}
        alt={stall.name}
        className={cn(styles.image, styles.imageHover)}
      />
      {!stall.isOpen && (
        <div className={styles.closedOverlay}>
          <span className={styles.closedLabel}>Closed</span>
        </div>
      )}
      <span className={styles.categoryBadge}>{stall.category}</span>
    </div>

    <div className={styles.body}>
      <h3 className={cn(styles.name, styles.nameHover)}>{stall.name}</h3>
      <p className={styles.description}>{stall.description}</p>

      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <Star className={styles.starIcon} />
          <span className={styles.ratingValue}>{stall.rating}</span>
          <span>({stall.reviewCount})</span>
        </div>
        <div className={styles.infoItem}>
          <Clock className={styles.icon} />
          <span>{stall.waitTime}</span>
        </div>
        <div className={styles.infoItem}>
          <MapPin className={styles.icon} />
          <span>{stall.location}</span>
        </div>
      </div>

      {stall.tags?.length > 0 && (
        <div className={styles.tagRow}>
          {stall.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </Link>
);

export const StallCardFeatured = ({ stall, eventId, eventTitle }) => (
  <Link
    to={`/events/${eventId}/stalls/${stall.id}`}
    className={cn(styles.featuredLink, "group")}
  >
    <div className={styles.featuredImageWrapper}>
      <img
        src={stall.image}
        alt={stall.name}
        className={cn(styles.featuredImage, styles.featuredImageHover)}
      />
      {!stall.isOpen && (
        <div className={styles.featuredClosedOverlay}>
          <span className={styles.featuredClosedLabel}>Closed</span>
        </div>
      )}
      <span className={styles.featuredCategoryBadge}>{stall.category}</span>
      <div className={styles.featuredRatingBadge}>
        <Star className={styles.featuredRatingStar} />
        <span className={styles.featuredRatingValue}>{stall.rating}</span>
      </div>
    </div>

    <div>
      <h4 className={cn(styles.featuredName, styles.featuredNameHover)}>
        {stall.name}
      </h4>
      <p className={styles.featuredEventTitle}>{eventTitle}</p>
      <div className={styles.featuredWaitRow}>
        <Clock className={styles.featuredWaitIcon} />
        <span>{stall.waitTime}</span>
      </div>
    </div>
  </Link>
);

export default StallCard;
