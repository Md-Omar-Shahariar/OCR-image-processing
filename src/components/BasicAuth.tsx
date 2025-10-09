"use client";

import { useState, useEffect } from "react";

interface BasicAuthProps {
  children: React.ReactNode;
}

export default function BasicAuth({ children }: BasicAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authStatus = sessionStorage.getItem("Access");
    if (authStatus === "Authenticated") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  };

  //   const handleLogin = (username: string, password: string) => {
  //     if (username === "knowledge" && password === "testPass123") {
  //       sessionStorage.setItem("Access", "Authenticated");
  //       setIsAuthenticated(true);
  //       return true;
  //     }
  //     return false;
  //   };
  const handleLogin = (username: string, password: string) => {
    if (username === "knowledge" && password === "testPass123") {
      sessionStorage.setItem("Access", "Authenticated");

      document.cookie = `Access=Authenticated; path=/; max-age=86400`; // 24 hours
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPopup onLogin={handleLogin} />;
  }

  return <>{children}</>;
}

interface AuthPopupProps {
  onLogin: (username: string, password: string) => boolean;
}

function AuthPopup({ onLogin }: AuthPopupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      setError("");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 border border-cyan-500/30 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">
            AUTHENTICATION_REQUIRED
          </h2>
          <p className="text-gray-400 text-sm">
            Please enter your credentials to access OCR_VISION_SUITE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg font-medium text-white hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-cyan-500/30"
          >
            AUTHENTICATE
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <div>DEMO_CREDENTIALS</div>
            <div>
              Username: <span className="text-cyan-400">knowledge</span>
            </div>
            <div>
              Password: <span className="text-cyan-400">testPass123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
