"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";

type ShortenResponse = {
  id: string;
  slug: string;
  shortUrl: string;
};

export default function UrlShortenerForm() {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [slug, setSlug] = useState("");
  const [displayedUrl, setDisplayedUrl] = useState<string>("");

  const userName =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const isValidUrl = (value: string): boolean => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const shortenMutation = useMutation<ShortenResponse, Error, string>({
    mutationFn: async (longUrl: string) => {
      const token = localStorage.getItem("token");

      if (token) {
        const res = await axios.post<ShortenResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/shorten`,
          { originalUrl: longUrl },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } else {
        const res = await axios.post<ShortenResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/shorten/public`,
          { originalUrl: longUrl },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return res.data;
      }
    },
    onSuccess: (data) => {
      setError("");
      setCopied(false);
      setDisplayedUrl(data.shortUrl);
      toast.success(`Shortened URL: ${data.shortUrl}`);
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
      setUrl("");
    },
  });

  const editMutation = useMutation<
    ShortenResponse,
    Error,
    { id: string; slug: string }
  >({
    mutationFn: async ({ id, slug }) => {
      const token = localStorage.getItem("token");
      const res = await axios.put<ShortenResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/urls/${id}`,
        { slug: slug },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Short link updated!");
      setOpenEdit(false);
      setDisplayedUrl(data.shortUrl);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update link");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setError("");
    shortenMutation.mutate(url);
  };

  const handleCopy = async () => {
    if (displayedUrl) {
      await navigator.clipboard.writeText(displayedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    if (shortenMutation.data?.slug) {
      setSlug(shortenMutation.data.slug);
      setOpenEdit(true);
    }
  };

  return (
    <Card className="w-full mt-12 max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome{" "}
          {userName
            ? (() => {
                const email = JSON.parse(userName).email as string;
                const namePart = email.split("@")[0];
                const formatted =
                  namePart.charAt(0).toUpperCase() + namePart.slice(1);
                return formatted;
              })()
            : "Guest"}
          !
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Enter a long URL below and we’ll shorten it for you.
          </p>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setError("");
                shortenMutation.reset();
                setUrl(e.target.value);
              }}
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="mt-6">
          <Button
            type="submit"
            className="sm:w-sm w-full cursor-pointer"
            disabled={shortenMutation.isPending}
          >
            {shortenMutation.isPending ? "Shortening..." : "Shorten URL"}
          </Button>
        </CardFooter>
      </form>

      {displayedUrl && (
        <div className="w-full flex flex-col px-6 mt-4">
          <h1 className="text-sm text-green-600 dark:text-green-400 font-medium">
            Success! Here is your Shortened URL :
          </h1>
          <div className="flex items-center justify-between pr-4">
            <Link
              href={displayedUrl}
              target="_blank"
              className="text-sm mr-8 text-purple-800 dark:text-purple-500 font-medium underline break-all max-w-xs block"
            >
              {displayedUrl}
            </Link>
            <div className="flex gap-x-2">
              {typeof window !== "undefined" &&
                localStorage.getItem("token") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="cursor-pointer"
                  >
                    Edit
                  </Button>
                )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slug</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                editMutation.mutate({
                  id: shortenMutation.data!.id,
                  slug,
                })
              }
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
}
