import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./components/products";
import Home from "./components/home";
import Register from "./components/register";
import Login from "./components/login";
import MyProducts from "./components/myProducts";
import ViewBid from "./components/viewBid";
import MyProfile from "./components/myProfile";
import AdminDashboard from "./components/Admin/adminDashboard";
import Checkout from "./components/checkout";
import AdminUsers from "./components/Admin/Adminusers";
import AdminEvents from "./components/Admin/adminEvents";
import AdminFinance from "./components/Admin/adminFinaces"; 
import SellerManagement from "./components/sellerManagement";
import AdminProductDetail from "./components/Admin/adminProductDetail";
import ProtectedRoute from "./routes/protectedroutes";  
import ProductDetails from "./components/productDetails";
import AdminProtectedRoute from "./routes/adminProtectedRoute";
import { AuthProvider,useAuth } from "./context/authContext";
import { useLocation } from "react-router-dom";
import AccountRestricted from "./components/accountRestrication";
import LoadingSpinner from "./components/LoadingSpinner";

const AppContent = () => {

  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. STACK GUARD: If we are still loading, show the spinner. 
  // Do NOT let the code proceed past this line until loading is false.
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. PATH CHECK: Define pages where the lockdown NEVER applies.
  const publicPaths = ["/login", "/register", "/"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // 3. THE LOCKDOWN: Use Optional Chaining (?.) to prevent "undefined" errors.
  // This says: "If user exists AND is NOT an admin AND is NOT active..."
  if (user && user?.role !== "admin") {
    
    // Normalize the status string to lowercase to prevent "Active" vs "active" bugs
    const currentStatus = user?.status;
    console.log("User status:", user.firstName, "| Is public page?", isPublicPage);

    if (currentStatus !== "active" && !isPublicPage) {
      return <AccountRestricted />;
    }
  }
  return(
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/products"
          element={
              <Products />   
          }
        />

         <Route
          path="/my-products"
          element={
            // <ProtectedRoute>
              <MyProducts />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            // <ProtectedRoute>
              <ProductDetails />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/my-product/:id"
          element={
            // <ProtectedRoute>
              <ViewBid />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            // <ProtectedRoute>
              <MyProfile />
            // </ProtectedRoute>
          }
        />

        <Route
            path="/checkout/:id"
            element={
              // <ProtectedRoute>
              <Checkout />
              // </ProtectedRoute>
            }
            />

            <Route
            path="/manage-listing/:id"
            element={
              // <ProtectedRoute>
              <SellerManagement />
              // </ProtectedRoute>
            }
            />

       <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/events"
            element={
              <AdminProtectedRoute>
                <AdminEvents />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/finance"
            element={
              <AdminProtectedRoute>
                <AdminFinance />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/product/:id"
            element={
              <AdminProtectedRoute>
                <AdminProductDetail />
              </AdminProtectedRoute>
            }
          />
      </Routes>

  );
}

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};



export default App;
