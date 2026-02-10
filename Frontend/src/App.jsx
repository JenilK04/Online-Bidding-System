import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./components/products";
import Home from "./components/home";
import Register from "./components/register";
import Login from "./components/login";
import MyProducts from "./components/myProducts";
import ViewBid from "./components/viewBid";

import ProtectedRoute from "./routes/protectedroutes";  
import ProductDetails from "./components/productDetails";

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
            // <ProtectedRoute>
              <Products />
            // </ProtectedRoute>
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
