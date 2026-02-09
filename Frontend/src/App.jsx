import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./components/products";
import Home from "./components/home";
import Register from "./components/register";
import Login from "./components/login";
import MyProducts from "./components/myProducts";

import ProtectedRoute from "./routes/protectedroutes";  

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
