import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Lock, Mail, User, UserPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterData, UserRole } from "../../types/auth";

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err) {
      // Error handling is done in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CityPulse
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md flex items-start">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} onChange={clearError}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                className={`input pl-10 w-full ${errors.username ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Choose a username"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className={`input pl-10 w-full ${errors.email ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`input pl-10 w-full ${errors.password ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Create a password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {showPassword ? "Hide" : "Show"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirm_password"
                type={showPassword ? "text" : "password"}
                className={`input pl-10 w-full ${errors.confirm_password ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Confirm your password"
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Register as
            </label>
            <select
              id="role"
              className={`input w-full ${errors.role ? "border-red-500 dark:border-red-500" : ""}`}
              {...register("role", { required: "Please select a role" })}
              defaultValue=""
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value={UserRole.USER}>Citizen</option>
              <option value={UserRole.WORKER}>Worker</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-teal-600 dark:text-teal-500 hover:text-teal-500 dark:hover:text-teal-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
