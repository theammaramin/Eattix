import { Link } from "react-router-dom";
import { Calendar, MapPin, UtensilsCrossed, Tag, Users } from "lucide-react";
import { formatDate, getStatusColor, capitalize } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./EventCard.module.css";

const EventCard = ({ event }) => (
  <Link to={`/events/${event.id}`} className={cn(styles.eventCard, "group")}>
    <div className={styles.imageWrapper}>
      <img
        src={event.image}
        alt={event.title}
        className={cn(styles.image, styles.imageHover)}
      />
      <div className={styles.badgeRow}>
        <span className={cn("badge shadow-sm", getStatusColor(event.status))}>
          {capitalize(event.status)}
        </span>
        <span className="badge bg-white/90 text-gray-700 shadow-sm">
          {event.category}
        </span>
      </div>
    </div>

    <div className={styles.body}>
      <h3 className={cn(styles.title, styles.titleHover)}>{event.title}</h3>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <Calendar className={styles.metaIcon} />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className={styles.metaRow}>
          <MapPin className={styles.metaIcon} />
          <span className={styles.metaText}>{event.location}</span>
        </div>
        <div className={styles.metaRow}>
          <UtensilsCrossed className={styles.metaIcon} />
          <span>{event.stallCount} food stalls</span>
        </div>
      </div>

      {event.tags?.length > 0 && (
        <div className={styles.tagRow}>
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
              <Tag className={styles.tagIcon} /> {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </Link>
);

export const EventCardScroll = ({ event }) => {
  const dateObj = new Date(event.date);
  const dayStr = dateObj
    .toLocaleDateString("en-AU", { weekday: "short" })
    .toUpperCase();
  const dateStr = dateObj
    .toLocaleDateString("en-AU", { day: "numeric", month: "short" })
    .toUpperCase();
  const fakeAttendees = Math.floor(Math.random() * 900) + 50;

  return (
    <Link to={`/events/${event.id}`} className={cn(styles.scrollLink, "group")}>
      <div className={styles.scrollImageWrapper}>
        <img
          src={event.image}
          alt={event.title}
          className={cn(styles.scrollImage, styles.scrollImageHover)}
        />
        <div className={styles.scrollGradient} />
        <div className={styles.interestedBadge}>
          <Users className="w-3 h-3" />
          <span>{fakeAttendees} interested</span>
        </div>
        <span className={styles.scrollCategoryBadge}>{event.category}</span>
      </div>

      <div className={styles.scrollMeta}>
        <p className={styles.scrollDate}>
          {dayStr}, {dateStr} · {event.time?.split(" - ")[0] || "10:00 AM"}
        </p>
        <h4 className={cn(styles.scrollTitle, styles.scrollTitleHover)}>
          {event.title}
        </h4>
        <p className={styles.scrollLocation}>{event.location.split(",")[0]}</p>
      </div>
    </Link>
  );
};

export default EventCard;
