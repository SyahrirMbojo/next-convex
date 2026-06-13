"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./navbar";

export default function MainBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";

  return (
    <div className="w-full mx-auto max-w-4xl">
      {!isAuth && <Navbar />}
      <div
        className={
          isAuth
            ? "container px-6 lg:px-0"
            : "container mt-20 pb-6 px-6 lg:px-0"
        }
      >
        {children}
      </div>
    </div>
  );
}
