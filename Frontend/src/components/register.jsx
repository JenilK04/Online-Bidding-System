import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TextField, Button, IconButton, InputAdornment, 
  CircularProgress, Alert, Divider, Typography 
} from "@mui/material";
import { Visibility, VisibilityOff, AppRegistration, Badge } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import API from "../services/api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  // personalId is required by your Mongoose model
  personalId: z.string().min(4, "Personal ID is required (e.g., Govt ID or Username)"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  password: z.string()
    .min(5, "Password must be at least 5 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[0-9]/, "Must contain one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError("");
      // This now sends firstName, lastName, email, personalId, password, and phone
      await API.post("/auth/register", data);
      navigate("/login?registered=true");
    } catch (error) {
      setApiError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT SIDE: Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <AppRegistration fontSize="large" />
            <Typography variant="h5" fontWeight="bold">BidMaster Pro</Typography>
          </div>
          <Typography variant="h2" fontWeight="800" className="leading-tight mb-6">
            The world's most <br /> 
            <span className="text-blue-300">transparent</span> auction platform.
          </Typography>
        </motion.div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-50" />
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="mb-8">
            <Typography variant="h4" fontWeight="bold" gutterBottom>Create Account</Typography>
            <Typography variant="body2" color="textSecondary">Enter your details to start bidding today.</Typography>
          </div>

          <AnimatePresence>
            {apiError && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Alert severity="error" className="mb-6">{apiError}</Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <TextField
                label="First Name"
                fullWidth
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                label="Last Name"
                fullWidth
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </div>

            <div>

            <TextField
              label="Email Address"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              />
            </div>

            {/* NEW FIELD: Personal ID (Required by your Mongoose Model) */}
            <div>
              <TextField
                label="Personal ID / Aadhar / SSN"
                fullWidth
                placeholder="Enter your unique identification number"
                {...register("personalId")}
                error={!!errors.personalId}
              helperText={errors.personalId?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: 'action.active', mr: 1, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            </div>

            <TextField
              label="Mobile Number"
              fullWidth
              placeholder="10-digit number"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            <Divider className="my-2">Security</Divider>
            
            <div>

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
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
                )
              }}
              />
            </div>
            
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5, mt: 2, fontWeight: 600, borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Typography variant="body2" color="textSecondary">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
            </Typography>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
 
export default Register;