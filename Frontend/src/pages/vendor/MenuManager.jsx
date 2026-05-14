import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import {
  getStallsByVendor,
  getMenuByStall,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/stallService";
import { formatCurrency } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import styles from "./MenuManager.module.css";

const EMPTY_ITEM = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  isAvailable: true,
  prepTime: 10,
  tags: "",
};

const MenuManager = () => {
  const { user } = useAuthStore();
  const [stall, setStall] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getStallsByVendor(user.id).then((stalls) => {
        if (stalls.length > 0) {
          setStall(stalls[0]);
          loadMenu(stalls[0].id);
        } else {
          setLoading(false);
        }
      });
    }
  }, [user]);

  const loadMenu = (stallId) => {
    setLoading(true);
    getMenuByStall(stallId).then((items) => {
      setMenu(items);
      setLoading(false);
    });
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_ITEM);
    setShowForm(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      tags: item.tags?.join(", ") || "",
      price: String(item.price),
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setForm(EMPTY_ITEM);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        prepTime: parseInt(form.prepTime) || 10,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      if (editItem) {
        const updated = await updateMenuItem(editItem.id, payload);
        setMenu(menu.map((m) => (m.id === editItem.id ? updated : m)));
        toast.success("Item updated");
      } else {
        const created = await createMenuItem(stall.id, payload);
        setMenu([...menu, created]);
        toast.success("Item added");
      }
      closeForm();
    } catch {
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteMenuItem(item.id);
      setMenu(menu.filter((m) => m.id !== item.id));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updated = await updateMenuItem(item.id, {
        isAvailable: !item.isAvailable,
      });
      setMenu(menu.map((m) => (m.id === item.id ? updated : m)));
      toast.success(
        updated.isAvailable
          ? "Item is now available"
          : "Item marked unavailable",
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const categories = [...new Set(menu.map((m) => m.category))];

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Menu Manager</h1>
          {stall && <p className={styles.subtitle}>{stall.name}</p>}
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className={styles.skeletonList}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : menu.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyEmoji}>🍽️</p>
          <h3 className={styles.emptyTitle}>No menu items yet</h3>
          <button onClick={openAdd} className="btn-primary mt-2">
            Add your first item
          </button>
        </div>
      ) : (
        <div className={styles.categoryList}>
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className={styles.categoryLabel}>{cat}</h3>
              <div className={styles.itemList}>
                {menu
                  .filter((m) => m.category === cat)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        styles.item,
                        !item.isAvailable && styles.itemUnavailable,
                      )}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                        />
                      )}
                      <div className={styles.itemInfo}>
                        <div className={styles.itemNameRow}>
                          <span className={styles.itemName}>{item.name}</span>
                          {!item.isAvailable && (
                            <span className="badge bg-gray-100 text-gray-500 text-xs">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className={styles.itemDesc}>{item.description}</p>
                        <p className={styles.itemPrice}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={styles.toggleBtn}
                          title="Toggle availability"
                        >
                          {item.isAvailable ? (
                            <ToggleRight className={styles.toggleOnIcon} />
                          ) : (
                            <ToggleLeft className={styles.toggleOffIcon} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className={styles.editBtn}
                        >
                          <Pencil className={styles.editIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className={styles.deleteBtn}
                        >
                          <Trash2 className={styles.deleteIcon} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? "Edit Item" : "Add Menu Item"}
              </h2>
              <button onClick={closeForm} className={styles.modalCloseBtn}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>
            <div className={styles.modalForm}>
              <div>
                <label className={styles.fieldLabel}>Item Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Butter Chicken + Naan"
                />
              </div>
              <div>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input resize-none"
                  rows={2}
                  placeholder="Describe the dish..."
                />
              </div>
              <div className={styles.twoCol}>
                <div>
                  <label className={styles.fieldLabel}>Price (AUD) *</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Prep Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.prepTime}
                    onChange={(e) =>
                      setForm({ ...form, prepTime: e.target.value })
                    }
                    className="input"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className={styles.fieldLabel}>Category *</label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input"
                  placeholder="e.g. Mains, Starters, Drinks"
                />
              </div>
              <div>
                <label className={styles.fieldLabel}>Image URL</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={styles.fieldLabel}>
                  Tags (comma separated)
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input"
                  placeholder="Vegan, Spicy, Popular"
                />
              </div>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm({ ...form, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500"
                />
                <span className={styles.checkboxLabel}>
                  Available for ordering
                </span>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button onClick={closeForm} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5"
              >
                <Check className={styles.saveBtnIcon} />{" "}
                {saving ? "Saving..." : editItem ? "Update" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
