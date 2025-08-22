"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  interface User {
    id: string;
    name: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      setUser(storedUser ? JSON.parse(storedUser) : null);
      setToken(storedToken);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    router.push("/LogIn");
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h2
          onClick={() => router.push("/")}
          className="text-2xl font-bold flex cursor-pointer"
        >
          URL Shortener
        </h2>
        <div className="flex gap-4 items-center">
          <ThemeToggle />

          {user && token && (
            <Button onClick={() => router.push("/History")}>History</Button>
          )}

          {user ? (
            <Button onClick={handleLogout}>Logout</Button>
          ) : (
            <Button onClick={() => router.push("/LogIn")}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
