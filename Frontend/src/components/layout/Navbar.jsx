import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  ChefHat,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import CartDrawer from "./CartDrawer";
import { cn } from "../../utils/cn";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "vendor") return "/vendor";
    if (user.role === "organizer") return "/organizer";
    return "/orders";
  };

  const navLinks = [{ label: "Events", to: "/events" }];

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          <div className={styles.bar}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>
              <ChefHat className={styles.logoIcon} />
              <span>Eattix</span>
            </Link>

            {/* Desktop nav links */}
            <div className={styles.desktopLinks}>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    styles.navLink,
                    location.pathname.startsWith(l.to) && styles.navLinkActive,
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right-side actions */}
            <div className={styles.actions}>
              <button
                onClick={() => setCartOpen(true)}
                className={styles.cartButton}
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className={styles.authRow}>
                  <Link
                    to={getDashboardPath()}
                    className={styles.dashboardLink}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className={styles.userPill}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={styles.avatar}
                    />
                    <span className={styles.userName}>
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={styles.guestRow}>
                  <Link to="/login" className={styles.loginBtn}>
                    Log in
                  </Link>
                  <Link to="/register" className={styles.signupBtn}>
                    Sign up
                  </Link>
                </div>
              )}

              <button
                className={styles.mobileToggle}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={styles.mobileDashboardLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <div className={styles.mobileUserRow}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={styles.mobileAvatar}
                  />
                  <div>
                    <p className={styles.mobileUserName}>{user.name}</p>
                    <p className={styles.mobileUserRole}>{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className={styles.mobileLogout}>
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className={styles.mobileGuestRow}>
                <Link
                  to="/login"
                  className={styles.mobileLoginBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileSignupBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
