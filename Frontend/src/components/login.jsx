import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  TextField, Button, IconButton, InputAdornment, 
  CircularProgress, Alert, Box, Typography, Paper 
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, MailOutline } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import API from "../services/api";

// ✅ Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Check if user was redirected from successful registration
  const isNewlyRegistered = new URLSearchParams(location.search).get("registered");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
  try {
    setLoading(true);
    setApiError("");
    
    const res = await API.post("auth/login", data);

    // 1. Secure Storage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // 2. 🛡️ Role-Based Redirection Logic
    const userRole = res.data.user.role;

    if (userRole === "admin") {
      // Send Admin to the Command Center
      navigate("/admin/dashboard");
    } else {
      // Send regular Users to the Product Gallery
      navigate("/products");
    }

  } catch (err) {
    // Check if the user is banned (using the 403 status we set in the controller)
    if (err.response?.status === 403) {
      setApiError("Your account has been suspended. Please contact support.");
    } else {
      setApiError(err.response?.data?.message || "Invalid email or password");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sleek Minimal Navbar */}
      <nav className="bg-slate-200 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">B</div>
          <span className="text-xl font-bold tracking-tight text-gray-800">BidMaster</span>
        </Link>
        <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Create Account
        </Link>
      </nav>

      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <Paper elevation={0} className="p-8 border border-gray-200 rounded-2xl shadow-sm bg-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
                <LockOutlined />
              </div>
              <Typography variant="h5" fontWeight="700" className="text-gray-900">
                Welcome Back
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mt-1">
                Enter your credentials to access your account
              </Typography>
            </div>

            <AnimatePresence mode="wait">
              {isNewlyRegistered && !apiError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                  <Alert severity="success">Registration successful! Please login.</Alert>
                </motion.div>
              )}
              {apiError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                  <Alert severity="error">{apiError}</Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <TextField
                fullWidth
                label="Email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline fontSize="small" className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
              />

              <div className="space-y-1">
                <div className="flex justify-end">
                  <Link to="/forgot-password" size="small" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-[1px] bg-gray-200 flex-grow"></div>
              <span className="text-xs text-gray-400 uppercase font-medium">New Here?</span>
              <div className="h-[1px] bg-gray-200 flex-grow"></div>
            </div>

            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="outlined"
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                color: "#4b5563",
                borderColor: "#d1d5db",
                "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" }
              }}
            >
              Create an account
            </Button>
          </Paper>
          
          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 BidMaster Pro. All rights reserved. <br />
            Secure 256-bit SSL encrypted connection.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;