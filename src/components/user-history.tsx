"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UrlData {
  id: number;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
}

const UserHistory = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUrls = async (): Promise<UrlData[]> => {
    if (!token) throw new Error("No token found");

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/urls`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery<UrlData[], Error>({
    queryKey: ["urls"],
    queryFn: fetchUrls,
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="w-full h-screen flex items-start justify-center p-4 text-red-500 font-bold text-xl">
        Please log in to view history
      </div>
    );
  }

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError)
    return (
      <div className="w-full h-screen flex items-start justify-center p-4 text-red-500 font-bold text-xl">
        Error loading data
      </div>
    );

  return (
    <div className="p-6 w-2/3">
      <Table>
        <TableCaption>A list of your shortened URLs</TableCaption>
        <TableHeader className="[&_th]:font-bold [&_th]:text-lg [&_th]:text-foreground">
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead>Short URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((url) => {
            return (
              <TableRow className="font-medium" key={url.id}>
                <TableCell>{url.slug}</TableCell>
                <TableCell className="truncate max-w-[250px]">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {url.originalUrl}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    {url.shortUrl}
                  </a>
                </TableCell>
                <TableCell>{url.clickCount}</TableCell>
                <TableCell>
                  {new Date(url.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserHistory;
