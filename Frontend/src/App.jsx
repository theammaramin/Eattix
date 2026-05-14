import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetail from "./pages/public/EventDetail";
import StallDetail from "./pages/public/StallDetail";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Checkout from "./pages/customer/Checkout";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderHistory from "./pages/customer/OrderHistory";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import IncomingOrders from "./pages/vendor/IncomingOrders";
import MenuManager from "./pages/vendor/MenuManager";
import StallProfile from "./pages/vendor/StallProfile";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import EventManager from "./pages/organizer/EventManager";
import StallApproval from "./pages/organizer/StallApproval";

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => <Outlet />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes — no navbar/footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main app routes — with navbar/footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route
            path="/events/:eventId/stalls/:stallId"
            element={<StallDetail />}
          />

          {/* Customer routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />

          {/* Vendor routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <IncomingOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/menu"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <MenuManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <StallProfile />
              </ProtectedRoute>
            }
          />

          {/* Organizer routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <EventManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:eventId"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <EventManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/stalls"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <StallApproval />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              <div className="text-center py-24">
                <p className="text-6xl mb-4">🍽️</p>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                  404 — Page not found
                </h1>
                <a href="/" className="btn-primary mt-4 inline-block">
                  Go Home
                </a>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
