import { useState, useEffect } from "react";
import { Save, Store } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { getStallsByVendor, updateStall } from "../../services/stallService";
import styles from "./StallProfile.module.css";

const CATEGORIES = [
  "Mexican",
  "BBQ",
  "Japanese",
  "Indian",
  "Italian",
  "Vietnamese",
  "Korean",
  "Mediterranean",
  "Burgers",
  "Desserts",
  "African",
  "Other",
];

const StallProfile = () => {
  const { user } = useAuthStore();
  const [stall, setStall] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getStallsByVendor(user.id).then((stalls) => {
        if (stalls.length > 0) {
          setStall(stalls[0]);
          setForm({
            name: stalls[0].name,
            description: stalls[0].description,
            category: stalls[0].category,
            image: stalls[0].image,
            banner: stalls[0].banner,
            isOpen: stalls[0].isOpen,
            tags: stalls[0].tags?.join(", ") || "",
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!stall) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      const updated = await updateStall(stall.id, payload);
      setStall(updated);
      toast.success("Stall profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className={styles.skeleton}>
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    );

  if (!stall)
    return (
      <div className={styles.notFound}>
        <Store className={styles.notFoundIcon} />
        <h2 className={styles.notFoundTitle}>No stall found</h2>
        <p className={styles.notFoundText}>
          Contact an organizer to set up your stall.
        </p>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>Stall Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          <Save className={styles.saveBtnIcon} />{" "}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Preview */}
      <div className={styles.previewCard}>
        <div className={styles.previewBanner}>
          <img
            src={form.banner || stall.banner}
            alt="banner"
            className={styles.previewBannerImg}
          />
        </div>
        <div className={styles.previewInfo}>
          <img
            src={form.image || stall.image}
            alt={form.name}
            className={styles.previewStallImg}
          />
          <div>
            <p className={styles.previewName}>{form.name}</p>
            <p className={styles.previewCategory}>{form.category}</p>
          </div>
          <div className={styles.previewStatusWrap}>
            <span
              className={`badge ${form.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
            >
              {form.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div>
          <label className={styles.fieldLabel}>Stall Name</label>
          <input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            rows={3}
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Category</label>
          <select
            value={form.category || ""}
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
          <label className={styles.fieldLabel}>Stall Image URL</label>
          <input
            value={form.image || ""}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Banner Image URL</label>
          <input
            value={form.banner || ""}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>Tags (comma separated)</label>
          <input
            value={form.tags || ""}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="input"
            placeholder="Halal, Vegetarian Options, Spicy"
          />
        </div>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.isOpen || false}
            onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
            className="w-4 h-4 accent-brand-500"
          />
          <span className={styles.checkboxLabel}>Stall is currently open</span>
        </label>
      </div>
    </div>
  );
};

export default StallProfile;
