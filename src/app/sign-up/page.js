'use client';

/**
 * File: src/app/sign-up/page.js
 *
 * Sign-up page (/sign-up). Name, email, password and role (job seeker or
 * recruiter) form with validation. Calls signup() from context/AuthContext.js
 * and opens /dashboard on success.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User, Briefcase, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const ROLES = [
  {
    value: "job_seeker",
    label: "Looking for a job",
    description: "Browse jobs and apply",
    icon: Search,
  },
  {
    value: "recruiter",
    label: "Hiring",
    description: "Post jobs and manage applications",
    icon: Briefcase,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email";

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = "Password must contain at least one letter and one number";
    }

    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await signup({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      setErrors({ email: result.error });
      return;
    }

    toast.success("Account created! Welcome 🎉");
    router.push("/dashboard");
    router.refresh();
  };

  const inputClass = (field) =>
    `w-full rounded-lg border pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account to find your dream job</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const active = form.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleChange("role", role.value)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      active
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1.5 ${active ? "text-blue-600" : "text-gray-500"}`} />
                    <span className="block text-sm font-medium text-gray-900">{role.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{role.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ali Raza"
                className={inputClass("name")}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass("email")}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="At least 8 characters"
                className={`${inputClass("password")} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className={inputClass("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-all"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
