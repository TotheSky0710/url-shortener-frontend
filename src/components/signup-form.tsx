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
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ToastContainer, toast } from "react-toastify";

type SignUpResponse = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const signUpMutation = useMutation<
    SignUpResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      const res = await api.post<SignUpResponse>("/user/signup", {
        email: credentials.email,
        password: credentials.password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setError("");
      toast(`Login successful! Welcome ${data.user.email}`);
      localStorage.setItem("token", data.token);
    },
    onError: (error) => {
      toast.error(error?.message);
      setError(error?.message || "Failed to sign up");
    },
  });

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include letters, numbers, and special characters."
      );
      return;
    }

    signUpMutation.mutate({ email, password });
  };

  return (
    <Card className="w-full mt-12 max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign Up
        </CardTitle>
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
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? "Signing up..." : "Sign Up"}
            </Button>
            <Button
              variant={"ghost"}
              onClick={(event) => {
                event.preventDefault();
                router.push("/LogIn");
              }}
              className="cursor-pointer w-max"
            >
              Login
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

export default SignUpForm;
