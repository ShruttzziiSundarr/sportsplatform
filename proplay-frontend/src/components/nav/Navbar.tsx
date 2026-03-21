"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart2, Building2, Calendar, ClipboardList, Compass, Globe, Home, MessageCircle, Trophy, User, Users, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/",           label: "Home",        icon: Home          },
  { href: "/dashboard",  label: "Dashboard",   icon: BarChart2     },
  { href: "/discover",   label: "Discover",    icon: Compass       },
  { href: "/log",        label: "Log Test",    icon: ClipboardList },
  { href: "/coach",      label: "Coach",       icon: Users         },
  { href: "/federation", label: "Federation",  icon: Globe         },
  { href: "/leaderboard",label: "Rankings",    icon: Trophy        },
  { href: "/academies",  label: "Academies",   icon: Building2     },
  { href: "/events",     label: "Events",      icon: Calendar      },
  { href: "/messages",   label: "Messages",    icon: MessageCircle },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 glass border-b border-white/8">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </span>
        <span className="font-bold text-sm tracking-tight text-white">Proplay</span>
      </Link>

      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </div>

      <Link
        href="/onboarding"
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        Create Profile
      </Link>
    </nav>
  );
}

