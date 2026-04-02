"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

const STATIC_NAV = [
  { name: "СТАТИСТИКА", href: "/" },
  { name: "СОСТАВ",     href: "/players" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="container flex h-[72px] items-center justify-between mx-auto px-4">
        <div className="hidden md:flex items-center gap-10">
          {STATIC_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-1 text-sm font-bold tracking-widest transition-all duration-300 uppercase",
                  isActive ? "text-white" : "text-white/50 hover:text-white"
                )}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[26px] left-0 right-0 h-[2px] bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}

          {/* МОЙ ПРОФИЛЬ — динамическая ссылка */}
          {(() => {
            const profileHref = session?.user?.id
              ? `/player/${session.user.id}`
              : "/api/auth/signin";
            const isActive = !!session?.user?.id && pathname === `/player/${session.user.id}`;
            return (
              <Link
                href={profileHref}
                className={cn(
                  "relative py-1 text-sm font-bold tracking-widest transition-all duration-300 uppercase",
                  isActive ? "text-white" : "text-white/50 hover:text-white"
                )}
              >
                МОЙ ПРОФИЛЬ
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[26px] left-0 right-0 h-[2px] bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })()}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-none bg-white text-black flex items-center justify-center border border-white/30 overflow-hidden font-bebas">
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-tighter">{session.user?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut()} 
                className="hover:bg-white hover:text-black rounded-none border border-transparent hover:border-white transition-all"
                title="ВЫЙТИ"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="bg-transparent text-white border-white hover:bg-white hover:text-black rounded-none font-bold uppercase tracking-widest px-6 transition-all duration-300 flex items-center"
              onClick={() => signIn("discord")}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.04c.458-.627.854-1.295 1.185-1.996a.076.076 0 0 0-.041-.105 13.015 13.015 0 0 1-1.873-.895.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.874.894.077.077 0 0 0-.041.107c.33.7.727 1.369 1.186 1.996a.078.078 0 0 0 .084.041 19.834 19.834 0 0 0 6.026-3.03.081.081 0 0 0 .031-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              ВОЙТИ ЧЕРЕЗ DISCORD
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
