
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

const AuthPage =({setUser}) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Signup disabled for production
  const [form, setForm] = useState({ email: "", username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Call login API
      try {
        const response = await axios.post("/auth/login",{ username: form.username, password: form.password });
        setUser(response?.data.user);
        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/create-song");
        }, 1200);
      } catch (err) {
        toast.error("Login failed. Please check your credentials.");
      }
    } else {
      // Signup is disabled in production
      // const response = await axios.post("/auth/register", form);
      // setUser(response.data);
      toast.error("Signup is disabled. Please contact admin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Signup fields are disabled in production */}
          {/*
          {!isLogin && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}
          */}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Signup toggle is disabled in production */}
        {/*
        <p className="text-center text-sm mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
        */}
      </div>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default AuthPage;