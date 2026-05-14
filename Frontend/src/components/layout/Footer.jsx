import { Link } from "react-router-dom";
import { ChefHat, Mail, Globe, Share2 } from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.footerGrid}>
        {/* Brand column */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logoLink}>
            <ChefHat className={styles.logoIcon} />
            Eattix
          </Link>
          <p className={styles.tagline}>
            The online platform for food stalls at events. Discover, order, and
            enjoy great food, all in one place.
          </p>
          <div className={styles.socialRow}>
            <a href="#" className={styles.socialLink}>
              <Mail className={styles.socialIcon} />
            </a>
            <a href="#" className={styles.socialLink}>
              <Globe className={styles.socialIcon} />
            </a>
            <a href="#" className={styles.socialLink}>
              <Share2 className={styles.socialIcon} />
            </a>
          </div>
        </div>

        {/* Explore column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Explore</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/events" className={styles.footerLink}>
                Browse Events
              </Link>
            </li>
            <li>
              <Link to="/register?role=vendor" className={styles.footerLink}>
                List Your Stall
              </Link>
            </li>
            <li>
              <Link to="/register?role=organizer" className={styles.footerLink}>
                Host an Event
              </Link>
            </li>
          </ul>
        </div>

        {/* Account column */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Account</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/login" className={styles.footerLink}>
                Log In
              </Link>
            </li>
            <li>
              <Link to="/register" className={styles.footerLink}>
                Sign Up
              </Link>
            </li>
            <li>
              <Link to="/orders" className={styles.footerLink}>
                My Orders
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} Eattix. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
