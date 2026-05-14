import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChefHat,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ShoppingBag,
  UtensilsCrossed,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { validateCaptcha } from "react-simple-captcha";
import CaptchaWidget from "../../components/CaptchaWidget";
import { cn } from "../../utils/cn";
import styles from "./Register.module.css";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    icon: ShoppingBag,
    description: "Browse events and order food",
  },
  {
    value: "vendor",
    label: "Stall Owner",
    icon: UtensilsCrossed,
    description: "List your stall and manage orders",
  },
  {
    value: "organizer",
    label: "Event Organizer",
    icon: Building,
    description: "Create and manage food events",
  },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(searchParams.get("role") || "customer");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef(null);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCaptcha(captchaInput)) {
      toast.error("Incorrect CAPTCHA. Please try again.");
      setCaptchaInput("");
      captchaRef.current?.reset();
      return;
    }
    try {
      const user = await register({ name, email, password, role });
      toast.success(`Account created! Welcome, ${user.name.split(" ")[0]}!`);
      if (user.role === "vendor") navigate("/vendor");
      else if (user.role === "organizer") navigate("/organizer");
      else navigate("/events");
    } catch (err) {
      toast.error(err.message);
      setCaptchaInput("");
      captchaRef.current?.reset();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.logoLink}>
            <ChefHat className={styles.logoIcon} /> Eattix
          </Link>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Join the food event community</p>
        </div>

        <div className={styles.formCard}>
          {/* Role selector */}
          <div>
            <p className={styles.roleHeading}>I am a...</p>
            <div className={styles.roleGrid}>
              {ROLES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    styles.roleBtn,
                    role === value && styles.roleBtnActive,
                  )}
                >
                  <Icon
                    className={cn(
                      styles.roleIcon,
                      role === value && styles.roleIconActive,
                    )}
                  />
                  <span
                    className={cn(
                      styles.roleLabel,
                      role === value && styles.roleLabelActive,
                    )}
                  >
                    {label}
                  </span>
                  <span className={styles.roleDesc}>{description}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label className={styles.fieldLabel}>Full Name</label>
              <div className={styles.fieldWrapper}>
                <User className={styles.fieldIcon} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-9"
                  placeholder="John Smith"
                />
              </div>
            </div>
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-10"
                  placeholder="Min. 6 characters"
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
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
