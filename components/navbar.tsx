"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-provider";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-background border-transparent"
      }`}
    >
      <div className="container mx-auto max-w-4xl py-4 px-6 lg:px-0 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-6">
          <Link href="/">
            <h1 className="font-bold text-2xl hover:opacity-80 transition-opacity">
              My Blog
            </h1>
          </Link>
          <div className="flex flex-row gap-1">
            <Link href="/">
              <Button variant={isActive("/") ? "default" : "ghost"}>
                Home
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant={isActive("/posts") ? "default" : "ghost"}>
                Posts
              </Button>
            </Link>
            {user && (
              <Link href="/users">
                <Button variant={isActive("/users") ? "default" : "ghost"}>
                  Users
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="flex items-center text-sm font-medium">
                Hi, {user.name}
              </span>
              <Button onClick={handleLogout} size="sm" variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={handleLogout} size="sm" variant="outline">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
