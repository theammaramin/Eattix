import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import {
  getEventById,
  createEvent,
  updateEvent,
} from "../../services/eventService";
import styles from "./EventManager.module.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  time: "",
  location: "",
  category: "Food Festival",
  image: "",
  banner: "",
  tags: "",
  status: "upcoming",
};

const CATEGORIES = [
  "Food Festival",
  "Night Market",
  "Cultural Festival",
  "Gourmet Event",
  "Pop-up Market",
];

const EventManager = () => {
  const { eventId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isNew = !eventId || eventId === "new";
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getEventById(eventId).then((ev) => {
        if (ev) {
          setForm({ ...ev, tags: ev.tags?.join(", ") || "" });
        }
        setLoading(false);
      });
    }
  }, [eventId, isNew]);

  const handleSave = async () => {
    if (!form.title || !form.date || !form.location) {
      toast.error("Title, date, and location are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        organizerId: user.id,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        endDate: form.endDate || form.date,
      };
      if (isNew) {
        await createEvent(payload);
        toast.success("Event created!");
      } else {
        await updateEvent(eventId, payload);
        toast.success("Event updated!");
      }
      navigate("/organizer");
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className={styles.skeleton}>
        <div className="h-8 bg-gray-200 rounded w-1/2" />
      </div>
    );

  return (
    <div className={styles.page}>
      <Link to="/organizer" className={styles.backLink}>
        <ArrowLeft className={styles.backIcon} /> Back to Dashboard
      </Link>

      <div className={styles.topRow}>
        <h1 className={styles.title}>
          {isNew ? "Create New Event" : "Edit Event"}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Event"}
        </button>
      </div>

      <div className={styles.formCard}>
        <div>
          <label className={styles.fieldLabel}>Event Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder="e.g. Adelaide Food Festival 2026"
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            rows={4}
            placeholder="Tell people about your event..."
          />
        </div>
        <div className={styles.twoCol}>
          <div>
            <label className={styles.fieldLabelWithIcon}>
              <Calendar className={styles.labelIcon} /> Start Date *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className={styles.fieldLabelWithIcon}>
              <Calendar className={styles.labelIcon} /> End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className={styles.fieldLabelWithIcon}>
            <Clock className={styles.labelIcon} /> Opening Hours
          </label>
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="input"
            placeholder="e.g. 10:00 AM - 9:00 PM"
          />
        </div>
        <div>
          <label className={styles.fieldLabelWithIcon}>
            <MapPin className={styles.labelIcon} /> Location *
          </label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="e.g. Victoria Square, Adelaide SA 5000"
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel}>Event Image URL</label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Banner Image URL</label>
          <input
            value={form.banner}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="input"
            placeholder="Family Friendly, Live Music, Outdoor"
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EventManager;
