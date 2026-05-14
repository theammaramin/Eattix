import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChefHat, Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { validateCaptcha } from "react-simple-captcha";
import CaptchaWidget from "../../components/CaptchaWidget";
import styles from "./Login.module.css";

const DEMO_ACCOUNTS = [
  {
    label: "Customer",
    email: "customer@eattix.com",
    role: "customer",
    emoji: "🛍️",
  },
  { label: "Vendor", email: "vendor@eattix.com", role: "vendor", emoji: "🍳" },
  {
    label: "Organizer",
    email: "organizer@eattix.com",
    role: "organizer",
    emoji: "🎪",
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCaptcha(captchaInput)) {
      toast.error("Incorrect CAPTCHA. Please try again.");
      setCaptchaInput("");
      captchaRef.current?.reset();
      return;
    }
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      if (user.role === "vendor") navigate("/vendor");
      else if (user.role === "organizer") navigate("/organizer");
      else navigate(from);
    } catch (err) {
      toast.error(err.message);
      setCaptchaInput("");
      captchaRef.current?.reset();
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("password123");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.logoLink}>
            <ChefHat className={styles.logoIcon} /> Eattix
          </Link>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Demo accounts */}
        <div className={styles.demoCard}>
          <p className={styles.demoLabel}>Demo accounts (click to fill)</p>
          <div className={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className={styles.demoBtn}
              >
                <span className={styles.demoEmoji}>{acc.emoji}</span>
                <span className={styles.demoRoleLabel}>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label className={styles.fieldLabel}>Email</label>
              <div className={styles.fieldWrapper}>
                <Mail className={styles.fieldIcon} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className={styles.fieldLabel}>Password</label>
              <div className={styles.fieldWrapper}>
                <Lock className={styles.fieldIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeOff className={styles.toggleIcon} />
                  ) : (
                    <Eye className={styles.toggleIcon} />
                  )}
                </button>
              </div>
            </div>
            <CaptchaWidget
              ref={captchaRef}
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className={styles.signupLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
