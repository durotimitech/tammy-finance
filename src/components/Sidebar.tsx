"use client";

import {
  LayoutDashboard,
  Wallet,
  LogOut,
  CreditCard,
  Settings,
  X,
  Flame,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "FIRE", href: "/dashboard/fire", icon: Flame },
  { name: "Assets", href: "/dashboard/assets", icon: Wallet },
  { name: "Liabilities", href: "/dashboard/liabilities", icon: CreditCard },
  { name: "Budget", href: "/dashboard/budgets", icon: Calculator },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Call the logout API route
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Force a hard refresh to clear all client-side state and cookies
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold font-pirata text-secondary">
            tammy
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-white font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={
                    isActive ? { backgroundColor: "var(--secondary)" } : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
