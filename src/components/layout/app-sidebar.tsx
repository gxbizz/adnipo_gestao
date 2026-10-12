"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Music2,
  Settings,
  Users,
  UserRound
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pessoas", label: "Pessoas", icon: UserRound },
  { href: "/grupos", label: "Grupos", icon: Users },
  { href: "/louvores", label: "Louvores", icon: Music2 },
  { href: "/cronograma", label: "Cronograma", icon: CalendarDays },
  { href: "/configuracoes", label: "Configurações", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">
        <span className="brand-mark">
          <Image
            alt="Logo da igreja"
            className="brand-logo"
            height={40}
            src="/images/adnipo-logo.jpeg"
            width={40}
          />
        </span>
        <span>ADNIPO Itaquera</span>
      </Link>
      <nav className="nav-list" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link className="nav-link" data-active={active} href={item.href} key={item.href}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
