"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { AxiosError } from "axios";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

type LoginError = {
  statusCode: number;
  message: string;
  error: string;
};

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const loginMutation = useMutation<
    LoginResponse,
    AxiosError<LoginError>,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      const res = await api.post<LoginResponse>("/user/login", {
        email: credentials.email,
        password: credentials.password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setError("");
      toast(`Login successful! Welcome ${data.user.email}`);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      router.push("/");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password";

      toast.error(message);
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate({ email, password });
  };

  return (
    <Card className="w-full mt-12 max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
      </CardHeader>
      <form className="flex flex-col gap-y-3" onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              required
            />
          </div>
          <div className="flex flex-col gap-y-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setError("");
                setPassword(e.target.value);
              }}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter>
          <div className="flex flex-col gap-3 w-full">
            <Button
              type="submit"
              className="w-full cursor-pointer mt-3"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <Button
              variant={"ghost"}
              onClick={(event) => {
                event.preventDefault();
                router.push("/SignUp");
              }}
              className="cursor-pointer w-max"
            >
              Sign Up
            </Button>
          </div>
        </CardFooter>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Card>
  );
};

export default LoginForm;
