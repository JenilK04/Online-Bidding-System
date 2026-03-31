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
import ProtectedRoute from "./routes/protectedroutes";  
import ProductDetails from "./components/productDetails";
import AdminProtectedRoute from "./routes/adminProtectedRoute";

function App() {
  return(
    <BrowserRouter>
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
      </Routes>

    </BrowserRouter>
  );
}

export default App;
